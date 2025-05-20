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
ORDER BY f.field_order
`,
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


    // 4. Upload to Open Dental Imaging
   if (!submission.patient_id) {
  throw new Error("Cannot upload to imaging: no patient_id on submission.");
}

const result = await uploadToImaging({
  patNum: submission.patient_id,
  locationId: submission.location_id,
  buffer: pdfBuffer,
  description: "Custom Form Submission"
});

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
