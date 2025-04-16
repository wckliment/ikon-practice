const express = require("express");
const router = express.Router();
const locationsController = require("../controllers/locationsController");
const authenticateUser = require("../middleware/authMiddleware");
const { isAdminOrOwner } = require("../middleware/roleMiddleware");
const { body, validationResult } = require("express-validator");

// GET location by unique code (public route — no auth required)
router.get("/by-code/:code", locationsController.getLocationByCode);

// ✅ Protect all location routes with JWT authentication
router.use(authenticateUser);

// GET all locations
router.get("/", locationsController.getAllLocations);


// GET single location by ID
router.get("/:id", locationsController.getLocationById);

// POST create new location with validation - restricted to admin/owner
router.post(
  "/",
  isAdminOrOwner, // Add role middleware
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("customer_key").trim().notEmpty().withMessage("Customer key is required"),
    body("developer_key").trim().notEmpty().withMessage("Developer key is required"),
    body("address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("zip").optional().trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  locationsController.createLocation
);

// PUT update location - restricted to admin/owner
router.put(
  "/:id",
  isAdminOrOwner, // Add role middleware
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("customer_key").trim().notEmpty().withMessage("Customer key is required"),
    body("developer_key").trim().notEmpty().withMessage("Developer key is required"),
    body("address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("zip").optional().trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  locationsController.updateLocation
);

// DELETE location - restricted to admin/owner
router.delete("/:id", isAdminOrOwner, locationsController.deleteLocation);

// GET users in a location
router.get("/:id/users", locationsController.getLocationUsers);



module.exports = router;
