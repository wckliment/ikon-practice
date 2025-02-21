const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Get all users
router.get("/", usersController.getAllUsers);

// Get user by ID
router.get("/:id", usersController.getUserById);

module.exports = router;
