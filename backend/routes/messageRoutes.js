const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const authenticateUser = require("../middleware/authMiddleware");

// Get all messages
router.get("/", authenticateUser, messagesController.getAllMessages);

// Get conversation for a specific user
router.get("/user/:id", authenticateUser, messagesController.getUserConversation);

// Get unread message count
router.get("/unread/:id", authenticateUser, messagesController.getUnreadCount);

// Create new message
router.post("/", authenticateUser, messagesController.createMessage);

// Mark message as read
router.put("/:id/read", authenticateUser, messagesController.markAsRead);

// Delete message
router.delete("/:id", authenticateUser, messagesController.deleteMessage);

module.exports = router;
