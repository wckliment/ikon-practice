const express = require("express");
const router = express.Router();
const tabletController = require("../controllers/tabletController");
const authenticateUser = require("../middleware/authMiddleware");

// Public: Tablet Login Route
router.post("/login", tabletController.tabletLogin);

// 🔐 Protected: Patient lookup & check-in
router.post("/patient-lookup", authenticateUser, tabletController.patientLookup);
router.post("/tablet-checkin", authenticateUser, tabletController.sendTabletCheckInMessage);

module.exports = router;
