const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authenticateUser = require("../middleware/authMiddleware"); // Import middleware

// ✅ Protect these routes with JWT authentication
router.get("/", authenticateUser, usersController.getAllUsers);
router.get("/:id", authenticateUser, usersController.getUserById);

module.exports = router;
