const express = require("express");
const router = express.Router();
const tabletController = require("../controllers/tabletController");

// POST /api/tablet/patient-lookup
router.post("/patient-lookup", tabletController.patientLookup);

module.exports = router;
