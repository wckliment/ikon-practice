const db = require('../config/db');
const { generateFormPdf } = require('../utils/generateFormPdf');

exports.submitForm = async (req, res) => {
  const formId = req.params.formId;
  const { patient_id, answers, submitted_by_ip } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Answers are required." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert into custom_form_submissions
    const [submissionResult] = await connection.query(
      `INSERT INTO custom_form_submissions (form_id, patient_id, submitted_by_ip)
       VALUES (?, ?, ?)`,
      [formId, patient_id || null, submitted_by_ip || null]
    );

    const submissionId = submissionResult.insertId;

    // 2. Insert answers into custom_form_answers
    const answerPromises = answers.map(ans => {
      const { field_id, value } = ans;

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
      [submissionId]
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
        a.id AS answer_id,
        a.field_id,
        a.value,
        f.label,
        f.field_type,
        f.options
       FROM custom_form_answers a
       JOIN custom_form_fields f ON a.field_id = f.id
       WHERE a.submission_id = ?`,
      [submissionId]
    );

    // Parse options from JSON
    const parsedAnswers = answers.map(a => ({
      ...a,
      options: a.options ? JSON.parse(a.options) : null
    }));

    const pdfBuffer = await generateFormPdf(submission, parsedAnswers, "Custom Form Submission");

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=submission_${submissionId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
