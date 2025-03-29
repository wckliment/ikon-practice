const express = require("express");
const router = express.Router();
const {
  getProviders,
  getProviderById,
} = require("../controllers/providersController");

// ✅ Corrected names
const authenticateUser = require("../middleware/authMiddleware");
const { initializeOpenDental } = require("../middleware/appointmentMiddleware");

// ✅ Use correct middleware
router.use(authenticateUser);
router.use(initializeOpenDental);

router.get("/", getProviders);
router.get("/:id", getProviderById);

module.exports = router;
