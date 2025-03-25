const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const authenticateUser = require("../middleware/authMiddleware");

// Protect these routes with JWT authentication
router.use(authenticateUser);

// Get practice information
router.get("/", practiceController.getPracticeInfo);

// Update practice information
router.put("/", practiceController.updatePracticeInfo);

module.exports = router;
