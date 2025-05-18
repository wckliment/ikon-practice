const express = require("express");
const router = express.Router();
const {
  generateCustomFormToken,
  getCustomFormByToken // ✅ Add this controller
} = require("../controllers/formTokenController");

router.post("/generate", generateCustomFormToken);

// ✅ This is the route your frontend is hitting: /api/custom-form-tokens/:token
router.get("/:token", getCustomFormByToken);

module.exports = router;
