const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const authenticateUser = require("../middleware/authMiddleware");

// Get all messages
router.get("/", authenticateUser, messagesController.getAllMessages);

// Get all messages for the current user
router.get("/all", authenticateUser, messagesController.getAllUserMessages);

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

// Get messages by type
router.get('/type/:type', messagesController.getMessagesByType);

// Get patient check-in messages for the current user
router.get('/patient-check-ins', messagesController.getPatientCheckIns);

// Patient check-in route
router.post('/patient-check-in', messagesController.createPatientCheckIn);

module.exports = router;
