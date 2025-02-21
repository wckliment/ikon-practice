const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const patientController = require("../controllers/patientController");

// GET /patients (No validation needed)
router.get("/", patientController.getAllPatients);

// POST /patients with Validation Middleware
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("dob").isISO8601().withMessage("Date of birth must be in YYYY-MM-DD format")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // If validation passes, move to the controller function
  },
  patientController.createPatient
);

module.exports = router;

