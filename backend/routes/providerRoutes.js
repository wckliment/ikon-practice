const express = require("express");
const router = express.Router();
const {
  getProviders,
  getProviderById,
} = require("../controllers/providersController");
const { attachOpenDentalService } = require("../middleware/appointmentMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken); // Protect all routes
router.use(attachOpenDentalService); // Attach OpenDentalService instance

router.get("/", getProviders); // GET /api/providers
router.get("/:id", getProviderById); // GET /api/providers/:id

module.exports = router;
