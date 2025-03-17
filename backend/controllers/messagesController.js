const Message = require("../models/messageModel");

// Get all messages for the logged-in user
exports.getAllMessages = (req, res) => {
  const userId = req.user.id; // Get the ID of the logged-in user from the auth middleware

  // Use the existing getConversation method instead of getAllMessages
  Message.getConversation(userId, (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
};

// Get conversation for a specific user
exports.getUserConversation = (req, res) => {
  const userId = req.params.id;     // This is the selected user ID
  const currentUserId = req.user.id; // This is the logged-in user's ID

  console.log("Fetching conversation between current user ID:", currentUserId, "and selected user ID:", userId);

  // Modified to only get messages between these two specific users
  Message.getConversationBetweenUsers(currentUserId, userId, (err, results) => {
    if (err) {
      console.error("Error fetching conversation:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    console.log("Conversation results:", results);
    res.json(results);
  });
};

// Get unread message count
exports.getUnreadCount = (req, res) => {
  const userId = req.params.id;

  Message.getUnreadCount(userId, (err, results) => {
    if (err) {
      console.error("Error getting unread count:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ unreadCount: results[0].count });
  });
};

// Mark message as read
exports.markAsRead = (req, res) => {
  const messageId = req.params.id;

  Message.markAsRead(messageId, (err, results) => {
    if (err) {
      console.error("Error marking message as read:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ success: true, message: "Message marked as read" });
  });
};

// Create new message
exports.createMessage = (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  // Validate required fields
  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Sender ID, receiver ID, and message are required" });
  }

  Message.create(sender_id, receiver_id, message, (err, results) => {
    if (err) {
      console.error("Error creating message:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    // Return the newly created message with its ID
    const newMessageId = results.insertId;

    // Create a response object with the message data
    const newMessage = {
      id: newMessageId,
      sender_id,
      receiver_id,
      message,
      created_at: new Date()
    };

    res.status(201).json(newMessage);
  });
};

// Delete message
exports.deleteMessage = (req, res) => {
  const messageId = req.params.id;

  Message.delete(messageId, (err, results) => {
    if (err) {
      console.error("Error deleting message:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ success: true, message: "Message deleted" });
  });
};
