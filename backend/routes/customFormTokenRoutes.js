const express = require("express");
const router = express.Router();
const {
  generateCustomFormToken,
  getCustomFormByToken,
  getTokensByPatient,
  deleteTokenById
} = require("../controllers/formTokenController");

const authenticateUser = require("../middleware/authMiddleware"); // ✅ ADD THIS
const ensureOpenDentalByToken = require("../middleware/ensureOpenDentalByToken");

// Public route: patient opens form by token
router.get("/:token", ensureOpenDentalByToken, getCustomFormByToken);

// Protected routes: staff interactions
router.post("/generate", authenticateUser, generateCustomFormToken);
router.get("/patient/:patNum", authenticateUser, getTokensByPatient);
router.delete("/:id", authenticateUser, deleteTokenById);

module.exports = router;
