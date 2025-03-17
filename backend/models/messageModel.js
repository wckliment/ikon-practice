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

// Get messages between two specific users
Message.getConversationBetweenUsers = (currentUserId, otherUserId, callback) => {
  const query = `
    SELECT m.*,
    s.name as sender_name,
    r.name as receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at DESC
  `;
  ikonDB.query(query, [currentUserId, otherUserId, otherUserId, currentUserId], callback);
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

// Create new message
Message.create = (senderID, receiverID, message, callback) => {
  const query = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
  ikonDB.query(query, [senderID, receiverID, message], callback);
};

// Delete message
Message.delete = (messageId, callback) => {
  const query = "DELETE FROM messages WHERE id = ?";
  ikonDB.query(query, [messageId], callback);
};

module.exports = Message;
