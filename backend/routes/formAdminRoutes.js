const express = require("express");
const router = express.Router();
const formSubmissionController = require("../controllers/formSubmissionController");
const authenticateUser = require("../middleware/authMiddleware");

// ✅ Dedicated route to avoid collisions
router.get("/returning-forms", authenticateUser, formSubmissionController.getReturningPatientSubmissions);

module.exports = router;
