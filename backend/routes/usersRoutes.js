const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authenticateUser = require("../middleware/authMiddleware");

// ✅ Protect these routes with JWT authentication
router.use(authenticateUser);

// Get all users
router.get("/", usersController.getAllUsers);

// Get single user by ID
router.get("/:id", usersController.getUserById);

// Update user's location
router.put(
  "/:id/location",
  usersController.updateUserLocation
);

// Get users by location
router.get("/location/:locationId", usersController.getUsersByLocation);

// Get users without a location
router.get("/no-location", usersController.getUsersWithoutLocation);

module.exports = router;
