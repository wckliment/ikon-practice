const ikonDB = require("../config/db");
const Message = {};

// Get all messages
Message.getAllMessages = (callback) => {
  const query = `
    SELECT m.*, u.name as sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    ORDER BY m.created_at DESC
  `;
  ikonDB.query(query, callback);
};

// Get messages between users (conversation)
Message.getConversation = (userId, callback) => {
  const query = `
    SELECT m.*,
    s.name as sender_name,
    r.name as receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    WHERE (m.sender_id = ? OR m.receiver_id = ?)
    ORDER BY m.created_at DESC
  `;
  ikonDB.query(query, [userId, userId], callback);
};

// Updated: Get messages between two specific users with optional type filter
Message.getConversationBetweenUsers = (currentUserId, otherUserId, type = null, callback) => {
  let query = `
    SELECT m.*,
    s.name as sender_name,
    r.name as receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
  `;

  // Add type filter if provided
  const queryParams = [currentUserId, otherUserId, otherUserId, currentUserId];
  if (type) {
    query += ` AND m.type = ?`;
    queryParams.push(type);
  }

  query += ` ORDER BY m.created_at DESC`;

  ikonDB.query(query, queryParams, callback);
};

// Get unread message count for a user
Message.getUnreadCount = (userId, callback) => {
  // If you don't have a 'read' column yet, you might want to add it or modify this query
  // For now, just return 0 to avoid errors
  callback(null, [{ count: 0 }]);
  // When you add a 'read' column, you can use this query instead:
  // const query = "SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0";
  // ikonDB.query(query, [userId], callback);
};

// Mark message as read
Message.markAsRead = (messageId, callback) => {
  // If you don't have a 'read' column yet, just return success
  callback(null, { affectedRows: 1 });
  // When you add a 'read' column, you can use this query instead:
  // const query = "UPDATE messages SET read = 1 WHERE id = ?";
  // ikonDB.query(query, [messageId], callback);
};

// Create new message (Updated to include type parameter)
Message.create = (senderID, receiverID, message, type = 'general', callback) => {
  const query = "INSERT INTO messages (sender_id, receiver_id, message, type) VALUES (?, ?, ?, ?)";
  ikonDB.query(query, [senderID, receiverID, message, type], callback);
};

// Delete message
Message.delete = (messageId, callback) => {
  const query = "DELETE FROM messages WHERE id = ?";
  ikonDB.query(query, [messageId], callback);
};

// Get all messages for a user across all conversations
Message.getAllUserMessages = (userId, callback) => {
  const query = `
    SELECT m.*,
    sender.name as sender_name,
    receiver.name as receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.created_at DESC
  `;
  ikonDB.query(query, [userId, userId], callback);
};

// New method: Get messages by type
Message.getMessagesByType = (type, callback) => {
  const query = `
    SELECT m.*,
    sender.name as sender_name,
    receiver.name as receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.type = ?
    ORDER BY m.created_at DESC
  `;
  ikonDB.query(query, [type], callback);
};

// New method: Get all messages for a user by location
Message.getAllUserMessagesByLocation = (userId, locationId, callback) => {
  const query = `
    SELECT m.*,
    sender.name as sender_name,
    receiver.name as receiver_name,
    sender.location_id as sender_location_id,
    receiver.location_id as receiver_location_id
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE (m.sender_id = ? OR m.receiver_id = ?)
    AND (
      (sender.location_id = ? AND (receiver.location_id = ? OR m.receiver_id IS NULL))
      OR
      (receiver.location_id = ? AND sender.location_id = ?)
    )
    ORDER BY m.created_at DESC
  `;

  ikonDB.query(query, [userId, userId, locationId, locationId, locationId, locationId], callback);
};

// Get patient check-in messages for user
Message.getPatientCheckInsForUser = (userId, callback) => {
  const query = `
    SELECT m.*,
    sender.name as sender_name,
    CASE
      WHEN m.receiver_id IS NULL THEN 'All Users'
      ELSE receiver.name
    END as receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.type = 'patient-check-in'
    AND (m.receiver_id IS NULL OR m.receiver_id = ? OR m.sender_id = ?)
    ORDER BY m.created_at DESC
  `;

  console.log(`DEBUG - Running patient check-in query for user ${userId}`);
  ikonDB.query(query, [userId, userId], callback);
};

module.exports = Message;
