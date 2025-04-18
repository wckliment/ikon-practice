const ikonDB = require("../config/db");

const Message = {};

// ✅ Get all messages
Message.getAllMessages = async () => {
  const query = `
    SELECT m.*, u.name AS sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    ORDER BY m.created_at DESC
  `;
  const [rows] = await ikonDB.query(query);
  return rows;
};

// ✅ Get conversation for a user
Message.getConversation = async (userId) => {
  const query = `
    SELECT m.*, s.name AS sender_name, r.name AS receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    WHERE
      (m.sender_id = ? OR m.receiver_id = ?)
      OR (m.type = 'patient-check-in' AND m.receiver_id IS NULL)
    ORDER BY m.created_at DESC
  `;
  const [rows] = await ikonDB.query(query, [userId, userId]);
  return rows;
};

// ✅ Get messages between two users
Message.getConversationBetweenUsers = async (currentUserId, otherUserId, type = null) => {
  let query = `
    SELECT m.*, s.name AS sender_name, r.name AS receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
  `;

  const params = [currentUserId, otherUserId, otherUserId, currentUserId];
  if (type) {
    query += ` AND m.type = ?`;
    params.push(type);
  }
  query += ` ORDER BY m.created_at DESC`;

  const [rows] = await ikonDB.query(query, params);
  return rows;
};

// ✅ Get unread count (placeholder until 'read' column is implemented)
Message.getUnreadCount = async (userId) => {
  return [{ count: 0 }];
};

// ✅ Mark message as read (placeholder until 'read' column is implemented)
Message.markAsRead = async (messageId) => {
  const query = `UPDATE messages SET is_read = TRUE WHERE id = ?`;
  return ikonDB.query(query, [messageId]);
};

// ✅ Create new message
Message.create = async (senderID, receiverID, message, type = 'general') => {
  const query = `INSERT INTO messages (sender_id, receiver_id, message, type) VALUES (?, ?, ?, ?)`;
  return ikonDB.query(query, [senderID, receiverID, message, type]);
};

// ✅ Delete message
Message.delete = async (messageId) => {
  const query = `DELETE FROM messages WHERE id = ?`;
  return ikonDB.query(query, [messageId]);
};

// ✅ Get all messages across conversations for a user
Message.getAllUserMessages = async (userId) => {
  const query = `
    SELECT m.*, sender.name AS sender_name, receiver.name AS receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.created_at DESC
  `;
  const [rows] = await ikonDB.query(query, [userId, userId]);
  return rows;
};

// ✅ Get messages by type
Message.getMessagesByType = async (type) => {
  const query = `
    SELECT m.*, sender.name AS sender_name, receiver.name AS receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.type = ?
    ORDER BY m.created_at DESC
  `;
  const [rows] = await ikonDB.query(query, [type]);
  return rows;
};

// ✅ Get patient check-in messages by location
Message.getPatientCheckInsByLocation = async (userId, locationId) => {
  const query = `
    SELECT m.*, sender.name AS sender_name,
      CASE
        WHEN m.receiver_id IS NULL THEN 'All Users'
        ELSE receiver.name
      END AS receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.type = 'patient-check-in'
      AND sender.location_id = ?
    ORDER BY m.created_at DESC
  `;
  const [rows] = await ikonDB.query(query, [locationId]);
  return rows;
};

// ✅ Get all user messages by location
Message.getAllUserMessagesByLocation = async (userId, locationId) => {
  const query = `
    SELECT m.*, sender.name AS sender_name, receiver.name AS receiver_name,
           sender.location_id AS sender_location_id, receiver.location_id AS receiver_location_id
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE
      (
        (m.sender_id = ? OR m.receiver_id = ?)
        AND (
          (sender.location_id = ? AND (receiver.location_id = ? OR m.receiver_id IS NULL))
          OR
          (receiver.location_id = ? AND sender.location_id = ?)
        )
      )
      OR
      (
      m.is_system = TRUE
      AND m.receiver_id IS NULL
      AND m.type IN ('ready-to-go-back', 'patient-check-in')
    )
    ORDER BY m.created_at DESC
  `;

  const [rows] = await ikonDB.query(query, [userId, userId, locationId, locationId, locationId, locationId]);
  return rows;
};

// ✅ Get patient check-in messages for a user
Message.getPatientCheckInsForUser = async (userId) => {
  const query = `
    SELECT m.*, sender.name AS sender_name,
      CASE
        WHEN m.receiver_id IS NULL THEN 'All Users'
        ELSE receiver.name
      END AS receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE m.type = 'patient-check-in'
      AND (m.receiver_id IS NULL OR m.receiver_id = ? OR m.sender_id = ?)
    ORDER BY m.created_at DESC
  `;
  const [rows] = await ikonDB.query(query, [userId, userId]);
  return rows;
};

// ✅ Mark all messages from one user to another as read
Message.markMessagesAsRead = async (currentUserId, otherUserId) => {
  const query = `
    UPDATE messages
    SET is_read = TRUE
    WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE
  `;
  return ikonDB.query(query, [currentUserId, otherUserId]);
};

module.exports = Message;
