const express = require("express");
const router = express.Router();
const formSubmissionController = require("../controllers/formSubmissionController");
const authenticateUser = require("../middleware/authMiddleware");

// ✅ New: fetch completed submissions for a patient
router.get("/patient/:patNum", authenticateUser, formSubmissionController.getSubmissionsByPatient);

// ✅  Add this to allow downloading PDFs like /api/forms/submissions/:id/pdf
router.get("/:submissionId/pdf", formSubmissionController.downloadSubmissionPdf)

module.exports = router;
