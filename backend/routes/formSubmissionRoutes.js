const express = require('express');
const router = express.Router({ mergeParams: true });
const formSubmissionController = require('../controllers/formSubmissionController');
const authenticateUser = require('../middleware/authMiddleware');

// ✅ Protect form submissions
router.post("/", authenticateUser, formSubmissionController.submitForm);

// Optional: leave read-only routes open
router.get("/:submissionId", formSubmissionController.getFormSubmissionById);
router.get("/:submissionId/pdf", formSubmissionController.downloadSubmissionPdf);
router.post("/:submissionId/upload", authenticateUser, formSubmissionController.uploadToImaging);

module.exports = router;
