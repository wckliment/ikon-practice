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
  const currentUserId = req.user.userId; // Changed from req.user.id

  console.log("DEBUG - Fetching conversation between users:");
  console.log("DEBUG - Current user ID (from token):", currentUserId, "Type:", typeof currentUserId);
  console.log("DEBUG - Selected user ID (from params):", userId, "Type:", typeof userId);

  // Convert IDs to ensure they're numbers for comparison
  const numCurrentUserId = Number(currentUserId);
  const numUserId = Number(userId);

  Message.getConversationBetweenUsers(numCurrentUserId, numUserId, (err, results) => {
    if (err) {
      console.error("Error fetching conversation:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log("DEBUG - Conversation results count:", results.length);
    if (results.length > 0) {
      console.log("DEBUG - First message:", results[0]);
    } else {
      console.log("DEBUG - No messages found between users", numCurrentUserId, "and", numUserId);

      // Let's run a direct query to double-check
      const query = `
        SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      `;
      const queryParams = [numCurrentUserId, numUserId, numUserId, numCurrentUserId];
      console.log("DEBUG - Running direct query:", query, "with params:", queryParams);

      // This is just for debugging - it won't affect the response
      require("../config/db").query(query, queryParams, (queryErr, queryResults) => {
        if (queryErr) {
          console.error("DEBUG - Direct query error:", queryErr);
        } else {
          console.log("DEBUG - Direct query results count:", queryResults.length);
          if (queryResults.length > 0) {
            console.log("DEBUG - First direct query result:", queryResults[0]);
          }
        }
      });
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

// New endpoint: Get patient check-in messages for a user
// New endpoint: Get patient check-in messages for a user
exports.getPatientCheckIns = (req, res) => {
  // Fix: Add fallback for when req.user is undefined
  const userId = req.user?.userId || (req.params && req.params.id);

  if (!userId) {
    console.error("Error: User ID not found in request");
    return res.status(400).json({ error: "User ID is required" });
  }

  Message.getPatientCheckInsForUser(userId, (err, results) => {
    if (err) {
      console.error("Error fetching patient check-in messages:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log(`DEBUG - Found ${results.length} patient check-in messages for user ${userId}`);
    res.json(results);
  });
};

// Create a patient check-in and send to all users
exports.createPatientCheckIn = (req, res) => {
  const { patientName, appointmentTime, doctorName, sender_id } = req.body;

  if (!patientName || !appointmentTime || !sender_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const message = `Patient ${patientName} has checked in for their ${appointmentTime} appointment with Dr. ${doctorName || 'Smith'}`;

  console.log("DEBUG - Creating patient check-in from user:", sender_id);
  console.log("DEBUG - Message:", message);

  // Get all users except the sender
  require("../models/userModel").getAllExceptSender(sender_id, (err, users) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log(`DEBUG - Found ${users.length} recipients for patient check-in`);

    // Create a message for each user
    let processedCount = 0;
    let errors = [];

    users.forEach(user => {
      Message.create(sender_id, user.id, message, 'patient-check-in', (msgErr, result) => {
        processedCount++;

        if (msgErr) {
          console.error(`Error sending check-in to user ${user.id}:`, msgErr);
          errors.push({ userId: user.id, error: msgErr.message });
        } else {
          console.log(`DEBUG - Sent check-in to user ${user.id}, message ID: ${result.insertId}`);
        }

        // When all messages are processed, send the response
        if (processedCount === users.length) {
          if (errors.length > 0) {
            return res.status(207).json({
              message: 'Some patient check-in messages failed to send',
              errors,
              successCount: processedCount - errors.length
            });
          }

          return res.status(201).json({
            message: 'Patient check-in messages sent successfully',
            count: processedCount
          });
        }
      });
    });
  });
};
