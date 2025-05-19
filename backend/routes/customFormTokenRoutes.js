const express = require("express");
const router = express.Router();
const {
  generateCustomFormToken,
  getCustomFormByToken // ✅ Add this controller
} = require("../controllers/formTokenController");

const ensureOpenDentalByToken = require("../middleware/ensureOpenDentalByToken");

router.post("/generate", generateCustomFormToken);

// ✅ Attach the middleware before the token-based form fetch
router.get("/:token", ensureOpenDentalByToken, getCustomFormByToken);

module.exports = router;
