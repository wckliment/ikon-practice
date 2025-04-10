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

//pin users for chats
router.patch("/:id/pin", usersController.togglePinStatus);

// Get locations for a user
router.get("/:id/locations", usersController.getUserLocations);

// Update user
router.put("/:id", usersController.updateUser);

// Delete user
router.delete("/:id", usersController.deleteUser);

// Update user appointment color
router.put("/:id/color", usersController.updateAppointmentColor);

module.exports = router;
