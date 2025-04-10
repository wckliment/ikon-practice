const express = require("express");
const router = express.Router();
const tabletController = require("../controllers/tabletController");

// POST /api/tablet/patient-lookup
router.post("/patient-lookup", tabletController.patientLookup);

// POST /api/tablet/tablet-checkin
router.post("/tablet-checkin", tabletController.sendTabletCheckInMessage);

module.exports = router;
