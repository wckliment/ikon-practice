const db = require('../config/db');
const { generateFormPdf } = require('../utils/generateFormPdf');
const { uploadToImaging } = require('../utils/openDentalUploader');



exports.submitForm = async (req, res) => {
  const formId = req.params.formId;
  let { patient_id, answers, submitted_by_ip } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Answers are required." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const locationId = req.user?.location_id;
    if (!locationId) {
      return res.status(400).json({ error: "Missing location_id for submission." });
    }

    // ✅ Fallback: If patient_id is not provided, get it from the latest token
    if (!patient_id) {
      const [[tokenRow]] = await connection.query(
        `SELECT patient_id FROM custom_form_tokens
         WHERE form_id = ?
         ORDER BY issued_at DESC
         LIMIT 1`,
        [formId]
      );

      if (!tokenRow || !tokenRow.patient_id) {
        throw new Error("Cannot determine patient_id for submission.");
      }

      patient_id = tokenRow.patient_id;
    }

    // 1. Insert into custom_form_submissions
    const [submissionResult] = await connection.query(
      `INSERT INTO custom_form_submissions (form_id, patient_id, submitted_by_ip, location_id)
       VALUES (?, ?, ?, ?)`,
      [formId, patient_id, submitted_by_ip || null, locationId]
    );

    const submissionId = submissionResult.insertId;

    // 2. Insert answers into custom_form_answers
    const answerPromises = answers.map(({ field_id, value }) => {
      return connection.query(
        `INSERT INTO custom_form_answers (submission_id, field_id, value)
         VALUES (?, ?, ?)`,
        [submissionId, field_id, value]
      );
    });

    await Promise.all(answerPromises);

    await connection.commit();
    res.status(201).json({ success: true, submission_id: submissionId });
  } catch (err) {
    await connection.rollback();
    console.error("Error submitting form:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};



exports.getFormSubmissionById = async (req, res) => {
  const submissionId = req.params.submissionId;

  try {
    // 1. Get the submission record (and join patient/form info if desired)
    const [[submission]] = await db.query(
      `SELECT id, form_id, patient_id, submitted_at, submitted_by_ip
       FROM custom_form_submissions
       WHERE id = ?`,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // 2. Get all answers + field definitions
    const [answers] = await db.query(
      `SELECT
          a.id AS answer_id,
          a.field_id,
          a.value,
          f.label,
          f.field_type,
          f.options
       FROM custom_form_answers a
       JOIN custom_form_fields f ON a.field_id = f.id
       WHERE a.submission_id = ?`,
      [submissionId, submissionId]
    );

    // Parse field options if needed
    const parsedAnswers = answers.map(a => ({
      ...a,
      options: a.options ? JSON.parse(a.options) : null
    }));

    res.json({ submission, answers: parsedAnswers });
  } catch (err) {
    console.error("Error fetching form submission:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.downloadSubmissionPdf = async (req, res) => {
  const submissionId = req.params.submissionId;

  try {
    // Get submission metadata
    const [[submission]] = await db.query(
      `SELECT * FROM custom_form_submissions WHERE id = ?`,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Get submitted answers with field info
 const [answers] = await db.query(
  `SELECT
  f.id AS field_id,
  f.label,
  f.field_type,
  f.options,
  f.section_title,
  COALESCE(a.value, '') AS value
FROM custom_form_fields f
LEFT JOIN custom_form_answers a ON a.field_id = f.id AND a.submission_id = ?
WHERE f.form_id = (
  SELECT form_id FROM custom_form_submissions WHERE id = ?
)
ORDER BY f.field_order`,
  [submissionId, submissionId]
);

    // Parse options from JSON
    const parsedAnswers = answers.map(a => ({
      ...a,
      options: a.options ? JSON.parse(a.options) : null
    }));

const [[formMeta]] = await db.query(
  `SELECT name FROM custom_forms WHERE id = ?`,
  [submission.form_id]
);

const pdfBuffer = await generateFormPdf(submission, parsedAnswers, formMeta?.name || "Submitted Form");


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=submission_${submissionId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.uploadToImaging = async (req, res) => {
  const { submissionId } = req.params;

  try {
    // 1. Lookup submission
    const [[submission]] = await db.query(
      `SELECT * FROM custom_form_submissions WHERE id = ?`,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    console.log("🧪 submission.patient_id:", submission.patient_id);
console.log("🧪 submission.location_id:", submission.location_id);
    if (!submission.patient_id || !submission.location_id) {
      return res.status(400).json({ error: "Submission is missing required linkage fields." });
    }

    // 2. Lookup answers with metadata
    const [answers] = await db.query(
      `SELECT
        f.id AS field_id,
        f.label,
        f.field_type,
        f.options,
        f.section_title,
        COALESCE(a.value, '') AS value
       FROM custom_form_fields f
       LEFT JOIN custom_form_answers a ON a.field_id = f.id AND a.submission_id = ?
       WHERE f.form_id = (
         SELECT form_id FROM custom_form_submissions WHERE id = ?
       )
       ORDER BY f.field_order`,
      [submissionId, submissionId]
    );

    const parsedAnswers = answers.map(a => ({
      ...a,
      options: a.options ? JSON.parse(a.options) : null
    }));

    // 3. Generate PDF
    const [[formMeta]] = await db.query(
      `SELECT name FROM custom_forms WHERE id = ?`,
      [submission.form_id]
    );

    const pdfBuffer = await generateFormPdf(submission, parsedAnswers, formMeta?.name || "Submitted Form");

    // 4. Debug logging before upload
    const description = `${formMeta?.name || "Submitted Form"} - ${new Date(submission.submitted_at).toLocaleDateString()}`;
    console.log("🧪 Preparing to upload PDF to Imaging:", {
      patNum: submission.patient_id,
      locationId: submission.location_id,
      hasBuffer: !!pdfBuffer,
      bufferLength: pdfBuffer?.length,
      description
    });

    // 5. Upload to Open Dental Imaging
    const result = await uploadToImaging({
      patNum: submission.patient_id,
      locationId: submission.location_id,
      buffer: pdfBuffer,
      description
    });

    await db.query(
  `UPDATE custom_form_submissions SET uploaded_at = NOW() WHERE id = ?`,
  [submissionId]
);

    res.status(200).json({ success: true, upload: result });
  } catch (err) {
    console.error("❌ Imaging upload error:", err);
    res.status(500).json({ error: "Failed to upload to imaging." });
  }
};

exports.getSubmissionsByPatient = async (req, res) => {
  const { patNum } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
         s.id AS submission_id,
         s.submitted_at,
         f.name AS form_name,
         f.description
       FROM custom_form_submissions s
       JOIN custom_forms f ON s.form_id = f.id
       WHERE s.patient_id = ?
       ORDER BY s.submitted_at DESC`,
      [patNum]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching submissions for patient:", err);
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
};

exports.getUnlinkedSubmissions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.id AS submission_id,
        s.form_id,
        s.submitted_at,
        s.location_id,
        f.name AS form_name,
        -- 🔍 Subqueries to extract first and last name from answers
        (
          SELECT a.value FROM custom_form_answers a
          JOIN custom_form_fields fld ON a.field_id = fld.id
          WHERE a.submission_id = s.id
            AND LOWER(fld.label) LIKE '%first name%'
          LIMIT 1
        ) AS first_name,
        (
          SELECT a.value FROM custom_form_answers a
          JOIN custom_form_fields fld ON a.field_id = fld.id
          WHERE a.submission_id = s.id
            AND LOWER(fld.label) LIKE '%last name%'
          LIMIT 1
        ) AS last_name
      FROM custom_form_submissions s
      JOIN custom_forms f ON s.form_id = f.id
      WHERE s.patient_id IS NULL
      ORDER BY s.submitted_at DESC
    `);

    // Add full name field
    const enhanced = rows.map((row) => ({
      ...row,
      patient_name: [row.first_name, row.last_name].filter(Boolean).join(" "),
    }));

    res.json(enhanced);
  } catch (err) {
    console.error("❌ Error fetching unlinked submissions:", err);
    res.status(500).json({ error: "Failed to fetch unlinked submissions." });
  }
};

exports.getLinkedSubmissions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         s.id AS submission_id,
         s.form_id,
         s.submitted_at,
         s.location_id,
         s.patient_id,
         f.name AS form_name
       FROM custom_form_submissions s
       JOIN custom_forms f ON s.form_id = f.id
       WHERE s.patient_id IS NOT NULL
       ORDER BY s.submitted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching linked submissions:", err);
    res.status(500).json({ error: "Failed to fetch linked submissions." });
  }
};

exports.submitFormPublic = async (req, res) => {
  let { answers, submitted_by_ip } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Answers are required." });
  }

  // Infer form_id from the first field's form_id (assuming fields always belong to the same form)
  const firstFieldId = answers[0]?.field_id;
  if (!firstFieldId) {
    return res.status(400).json({ error: "Missing field_id in answers." });
  }

  try {
    // Step 1: Get the form_id from the field
    const [[fieldRow]] = await db.query(
      `SELECT form_id FROM custom_form_fields WHERE id = ?`,
      [firstFieldId]
    );

    if (!fieldRow) {
      return res.status(400).json({ error: "Invalid field_id: cannot resolve form_id." });
    }

    const formId = fieldRow.form_id;

    // ✅ Step 2: Lookup latest token for this form to extract patient_id
   const [[tokenRow]] = await db.query(
  `SELECT patient_id, location_id FROM custom_form_tokens
   WHERE form_id = ?
   ORDER BY issued_at DESC
   LIMIT 1`,
  [formId]
   );

    if (!tokenRow) {
  console.warn("⚠️ No token found for form ID:", formId);
}

    const patientId = tokenRow?.patient_id || null;
    const locationId = tokenRow?.location_id || null;

    console.log("📥 Submitting form with:", {
  formId,
  patientId,
  locationId,
  submitted_by_ip
});

    // Step 3: Insert submission with resolved patient_id
   const [submissionResult] = await db.query(
  `INSERT INTO custom_form_submissions (form_id, patient_id, location_id, submitted_by_ip)
   VALUES (?, ?, ?, ?)`,
  [formId, patientId, locationId, submitted_by_ip || null]
);

    const submissionId = submissionResult.insertId;

    // Step 4: Insert answers
    const answerPromises = answers.map(({ field_id, value }) => {
      return db.query(
        `INSERT INTO custom_form_answers (submission_id, field_id, value)
         VALUES (?, ?, ?)`,
        [submissionId, field_id, value]
      );
    });

    await Promise.all(answerPromises);

    res.status(201).json({ success: true, submission_id: submissionId });
  } catch (err) {
    console.error("❌ Error in submitFormPublic:", err);
    res.status(500).json({ error: "Failed to submit public form." });
  }
};

exports.linkSubmissionToPatient = async (req, res) => {
  const { submissionId } = req.params;
  const { patNum } = req.body;
  const locationId = req.user?.location_id;

  if (!submissionId || !patNum || !locationId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await db.query(
      `UPDATE custom_form_submissions
       SET patient_id = ?, location_id = ?
       WHERE id = ?`,
      [patNum, locationId, submissionId]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error linking submission:", err);
    res.status(500).json({ error: "Failed to link submission." });
  }
};

exports.getReturningPatientSubmissions = async (req, res) => {
  console.log("🔥 getReturningPatientSubmissions was called");

  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [submissions] = await db.query(`
      SELECT
        cfs.*,
        cf.name AS form_name
      FROM custom_form_submissions cfs
      JOIN custom_forms cf ON cfs.form_id = cf.id
      WHERE cfs.patient_id IS NOT NULL
        AND cfs.id NOT IN (
          SELECT submission_id
          FROM user_cleared_uploaded_forms
          WHERE user_id = ?
        )
      ORDER BY cfs.submitted_at DESC
    `, [userId]);

    const submissionsWithPatient = await Promise.all(
      submissions.map(async (submission) => {
        try {
          const patient = await req.openDentalService.getPatient(submission.patient_id);
          return {
            ...submission,
            patientName: `${patient.FName} ${patient.LName}`,
            birthdate: patient.Birthdate,
            phone: patient.HmPhone || patient.WkPhone || patient.WirelessPhone || null,
          };
        } catch (err) {
          console.warn(`⚠️ Failed to fetch patient ${submission.patient_id}:`, err.response?.data || err.message || err);
          return {
            ...submission,
            patientName: "Unknown",
            birthdate: null,
            phone: null,
          };
        }
      })
    );

    res.json(submissionsWithPatient);
  } catch (error) {
    console.error("❌ Error fetching returning patient submissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Clear uploaded form from user view
exports.clearUploadedForm = async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await db.query(
      `INSERT INTO user_cleared_uploaded_forms (user_id, submission_id)
       VALUES (?, ?)`,
      [userId, submissionId]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error clearing uploaded form:", err);
    res.status(500).json({ error: "Failed to clear uploaded form." });
  }
};
