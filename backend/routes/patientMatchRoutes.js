const express = require("express");
const router = express.Router();
const { matchPatient } = require("../controllers/patientMatchController");

router.get("/match", matchPatient);

module.exports = router;
