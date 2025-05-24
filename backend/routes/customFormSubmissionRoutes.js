const express = require("express");
const router = express.Router();
const formSubmissionController = require("../controllers/formSubmissionController");
const authenticateUser = require("../middleware/authMiddleware");

console.log("📁 customFormSubmissionRoutes.js loaded");

router.get("/test-ping", (req, res) => {
  console.log("🧪 /test-ping route HIT");
  res.json({ message: "pong" });
});

// ✅ New: fetch completed submissions for a patient
router.get("/patient/:patNum", authenticateUser, formSubmissionController.getSubmissionsByPatient);

// ✅ Safer path to avoid collision with dynamic :submissionId
router.get("/admin/returning-forms", formSubmissionController.getReturningPatientSubmissions);

// // ✅  Add this to allow downloading PDFs like /api/forms/submissions/:id/pdf
router.get("/:submissionId/pdf", formSubmissionController.downloadSubmissionPdf);

router.stack.forEach((r) => {
  if (r.route) {
    console.log(`🛣️ ${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
  }
});

module.exports = router;
