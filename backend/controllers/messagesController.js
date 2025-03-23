const Message = require("../models/messageModel");

// Get all messages for the logged-in user
exports.getAllMessages = (req, res) => {
  const userId = req.user.userId; // Changed from req.user.id

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
  const userId = req.params.id;
  const currentUserId = req.user.userId;
  const messageType = req.query.type; // Get the type from query params

  console.log("DEBUG - Fetching conversation between users:");
  console.log("DEBUG - Current user ID (from token):", currentUserId, "Type:", typeof currentUserId);
  console.log("DEBUG - Selected user ID (from params):", userId, "Type:", typeof userId);
  console.log("DEBUG - Message type filter:", messageType);

  // Convert IDs to ensure they're numbers for comparison
  const numCurrentUserId = Number(currentUserId);
  const numUserId = Number(userId);

  Message.getConversationBetweenUsers(numCurrentUserId, numUserId, messageType, (err, results) => {
    if (err) {
      console.error("Error fetching conversation:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log("DEBUG - Conversation results count:", results.length);
    if (results.length > 0) {
      console.log("DEBUG - First message:", results[0]);
    } else {
      console.log("DEBUG - No messages found between users", numCurrentUserId, "and", numUserId,
                  messageType ? `with type ${messageType}` : "");
    }

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

// Create new message - Updated to include message type
exports.createMessage = (req, res) => {
  const { sender_id, receiver_id, message, type = 'general' } = req.body;

  // Validate required fields
  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Sender ID, receiver ID, and message are required" });
  }

  Message.create(sender_id, receiver_id, message, type, (err, results) => {
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
      type,
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

// Get all messages for the current user across all conversations
exports.getAllUserMessages = (req, res) => {
  const currentUserId = req.user.userId; // Using req.user.userId based on your code pattern

  console.log("DEBUG - Fetching all messages for user:", currentUserId);

  // You'll need to add this method to your Message model
  Message.getAllUserMessages(currentUserId, (err, results) => {
    if (err) {
      console.error("Error fetching all user messages:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log(`DEBUG - Found ${results.length} messages for user ${currentUserId}`);
    res.json(results);
  });
};

// New endpoint: Get messages by type
exports.getMessagesByType = (req, res) => {
  const { type } = req.params;

  Message.getMessagesByType(type, (err, results) => {
    if (err) {
      console.error(`Error fetching ${type} messages:`, err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log(`DEBUG - Found ${results.length} messages of type ${type}`);
    res.json(results);
  });
};

// Get patient check-in messages
exports.getPatientCheckIns = (req, res) => {
  let userId;

  // Check different possible sources for the user ID
  if (req.user && req.user.userId) {
    userId = req.user.userId;
  } else if (req.params && req.params.id) {
    userId = req.params.id;
  } else if (req.query && req.query.userId) {
    userId = req.query.userId;
  }

  if (!userId) {
    console.error("Warning: User ID not found in request, using default");
    // Use current user's ID if available, otherwise default to broadcast messages
    userId = req.user?.userId || -1;
  }

  console.log(`DEBUG - Fetching patient check-ins for user ${userId}`);

  Message.getPatientCheckInsForUser(userId, (err, results) => {
    if (err) {
      console.error("Error fetching patient check-in messages:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log(`DEBUG - Found ${results.length} patient check-in messages for user ${userId}`);
    if (results.length > 0) {
      console.log("Sample message:", results[0]);
    }

    res.json(results);
  });
};

// Create a patient check-in - Modified to use NULL for broadcast messages
exports.createPatientCheckIn = (req, res) => {
  const { patientName, appointmentTime, doctorName, sender_id } = req.body;

  if (!patientName || !appointmentTime || !sender_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const message = `Patient ${patientName} has checked in for their ${appointmentTime} appointment with Dr. ${doctorName || 'Smith'}`;

  console.log("DEBUG - Creating patient check-in broadcast message");
  console.log("DEBUG - Message:", message);

  // Use NULL instead of BROADCAST_ID (-1)
  Message.create(sender_id, null, message, 'patient-check-in', (err, result) => {
    if (err) {
      console.error("Error creating patient check-in:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log(`DEBUG - Created patient check-in message ID: ${result.insertId}`);

    return res.status(201).json({
      message: 'Patient check-in message created successfully',
      messageId: result.insertId
    });
  });
};
