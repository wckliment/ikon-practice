const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const authenticateUser = require("../middleware/authMiddleware");
const { sendSystemMessage } = require('../utils/systemMessaging');

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
router.get('/patient-check-ins', authenticateUser, messagesController.getPatientCheckIns);


// Debug endpoint - Get all patient check-in messages
router.get('/debug/patient-check-ins', authenticateUser, (req, res) => {
  const query = `
    SELECT m.*,
    sender.name as sender_name,
    receiver.name as receiver_name,
    m.type as message_type
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.type = 'patient-check-in'
    ORDER BY m.created_at DESC
  `;

  ikonDB.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: results.length, results });
  });
});

//TEST ROUTE for Patient Check-in-Websocket
router.post('/test-system', async (req, res) => {
  try {
    const { message, locationId } = req.body || {};
    console.log(`Attempting to send test system message: "${message}" to location ${locationId}`);

    const result = await sendSystemMessage(
      message || "🦷 Test Patient has checked in and is ready to go back.",
      locationId || 6 // Default to location 6 if not provided
    );

    console.log(`Test system message sent, result:`, result);
    res.json({ success: true, message: result });
  } catch (err) {
    console.error(`Error sending test system message:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Patient check-in route
router.post('/patient-check-in', authenticateUser, messagesController.createPatientCheckIn);

// Mark messages as read
router.post('/mark-read/:id', authenticateUser, messagesController.markMessagesAsRead);


module.exports = router;
