const Message = require("../models/messageModel");

// Get all messages for the logged-in user
exports.getAllMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.getConversation(userId);
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get conversation for a specific user
exports.getUserConversation = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const currentUserId = Number(req.user.userId);
    const messageType = req.query.type;

    const messages = await Message.getConversationBetweenUsers(currentUserId, userId, messageType);
    res.json(messages);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await Message.getUnreadCount(userId);
    res.json({ unreadCount: result[0]?.count || 0 });
  } catch (err) {
    console.error("Error getting unread count:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    await Message.markAsRead(messageId);
    res.json({ success: true, message: "Message marked as read" });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Create new message
exports.createMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message, type = 'general' } = req.body;

    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({ error: "Sender ID, receiver ID, and message are required" });
    }

    const result = await Message.create(sender_id, receiver_id, message, type);

    const newMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      type,
      created_at: new Date()
    };

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    await Message.delete(messageId);
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get all messages for the current user across all conversations
exports.getAllUserMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const currentUserLocationId = req.user.location_id;
    const messages = await Message.getAllUserMessagesByLocation(currentUserId, currentUserLocationId);
    res.json(messages);
  } catch (err) {
    console.error("Error fetching all user messages:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get messages by type
exports.getMessagesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const messages = await Message.getMessagesByType(type);
    res.json(messages);
  } catch (err) {
    console.error(`Error fetching ${type} messages:`, err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get patient check-in messages
exports.getPatientCheckIns = async (req, res) => {
  try {
    const userId = req.user.userId;
    const locationId = req.user.location_id;
    const messages = await Message.getPatientCheckInsByLocation(userId, locationId);
    res.json(messages);
  } catch (err) {
    console.error("Error fetching patient check-in messages:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Create a patient check-in
exports.createPatientCheckIn = async (req, res) => {
  try {
    const { patientName, appointmentTime, doctorName, sender_id } = req.body;

    if (!patientName || !appointmentTime || !sender_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = `Patient ${patientName} has checked in for their ${appointmentTime} appointment with Dr. ${doctorName || 'Smith'}`;
    const result = await Message.create(sender_id, null, message, 'patient-check-in');

    res.status(201).json({
      message: 'Patient check-in message created successfully',
      messageId: result.insertId
    });
  } catch (err) {
    console.error("Error creating patient check-in:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

