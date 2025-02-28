const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");

// User Registration Route
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("dob").isISO8601().withMessage("Date of Birth must be a valid date (YYYY-MM-DD)"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role")
      .toLowerCase() // Convert role to lowercase before storing
      .isIn(["admin", "dentist", "staff", "hygienist"])
      .withMessage("Role must be Admin, Dentist, Staff, or Hygienist"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  authController.register
);

// User Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  authController.login
);

module.exports = router;

