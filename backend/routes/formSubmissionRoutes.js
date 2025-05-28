const express = require('express');
const router = express.Router({ mergeParams: true });
const formSubmissionController = require('../controllers/formSubmissionController');
const authenticateUser = require('../middleware/authMiddleware');
const db = require('../config/db');
const { generateFormPdf } = require('../utils/generateFormPdf');
const authenticateFlexible = require('../middleware/authenticateFlexible');

// ✅ Staff or Tablet form submission
router.post("/", authenticateFlexible, formSubmissionController.submitForm);

// ✅ Public form submission (no auth)
router.post("/public", formSubmissionController.submitFormPublic);

// ✅ Get all unlinked form submissions (no patient_id)
router.get("/unlinked", authenticateUser, formSubmissionController.getUnlinkedSubmissions);

// ✅ Get all linked form submissions (with patient_id)
router.get("/linked", authenticateUser, formSubmissionController.getLinkedSubmissions);

router.put(
  "/:submissionId/clear-upload",
  authenticateUser,
  formSubmissionController.clearUploadedForm
);


// ✅ Get a single submission by ID
router.get("/:submissionId", formSubmissionController.getFormSubmissionById);

// ✅ Download the PDF of a submission
router.get("/:submissionId/pdf", formSubmissionController.downloadSubmissionPdf);

// ✅ Upload the PDF to Open Dental Imaging
router.post("/:submissionId/upload", authenticateUser, formSubmissionController.uploadToImaging);

// ✅ Get all completed submissions for a patient
router.get("/patient/:patNum", authenticateUser, formSubmissionController.getSubmissionsByPatient);

// ✅ Generate and return base64 PDF (used by Create Patient flow)
router.post("/generate-pdf", authenticateUser, async (req, res) => {
  const { submission_id } = req.body;

  try {
    // Pull submission
    const [[submission]] = await db.query(
      `SELECT * FROM custom_form_submissions WHERE id = ?`,
      [submission_id]
    );
    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    // Pull all form fields + answers
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
      [submission_id, submission_id]
    );

    const parsedAnswers = answers.map(a => ({
      ...a,
      options: a.options ? JSON.parse(a.options) : null
    }));

    const [[formMeta]] = await db.query(
      `SELECT name FROM custom_forms WHERE id = ?`,
      [submission.form_id]
    );

    const pdfBuffer = await generateFormPdf(submission, parsedAnswers, formMeta?.name || "Submitted Form");
    const base64Pdf = pdfBuffer.toString("base64");

    res.json({ base64Pdf });
  } catch (err) {
    console.error("❌ Error in /generate-pdf:", err);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

// ✅ Link a submission to a patient after patient creation
router.put("/:submissionId/link", authenticateUser, formSubmissionController.linkSubmissionToPatient);

router.delete('/:submissionId', authenticateUser, formSubmissionController.deleteSubmission);


module.exports = router;
