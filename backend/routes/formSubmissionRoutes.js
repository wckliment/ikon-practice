const express = require('express');
const router = express.Router({ mergeParams: true });
const formSubmissionController = require('../controllers/formSubmissionController');
const authenticateUser = require('../middleware/authMiddleware');

// ✅ Staff form submission (requires auth)
router.post("/", authenticateUser, formSubmissionController.submitForm);

// ✅ Public form submission (no auth)
router.post("/public", formSubmissionController.submitFormPublic);

// ✅ Get all unlinked form submissions (no patient_id)
router.get("/unlinked", authenticateUser, formSubmissionController.getUnlinkedSubmissions);

// ✅ Get all linked form submissions (with patient_id)
router.get("/linked", authenticateUser, formSubmissionController.getLinkedSubmissions);


// ✅ Get a single submission by ID
router.get("/:submissionId", formSubmissionController.getFormSubmissionById);

// ✅ Download the PDF of a submission
router.get("/:submissionId/pdf", formSubmissionController.downloadSubmissionPdf);

// ✅ Upload the PDF to Open Dental Imaging
router.post("/:submissionId/upload", authenticateUser, formSubmissionController.uploadToImaging);

// ✅ Get all completed submissions for a patient
router.get("/patient/:patNum", authenticateUser, formSubmissionController.getSubmissionsByPatient);



module.exports = router;
