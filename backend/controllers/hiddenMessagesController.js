const db = require("../config/db");

// ✅ Route: POST /api/messages/hidden/hide - Hide a single message
exports.hideMessage = async (req, res) => {
  const userId = req.user.id;
  const { messageId } = req.body;

  if (!messageId) {
    return res.status(400).json({ error: 'Message ID is required' });
  }

  try {
    await db.query(
      'INSERT IGNORE INTO user_hidden_messages (user_id, message_id) VALUES (?, ?)',
      [userId, messageId]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error hiding message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.hideMessagesForUser = async (req, res) => {
  const userId = req.user.id; // 🔁 CHANGE THIS LINE to get the ID from token
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ error: "messageIds are required" });
  }

  try {
    const values = messageIds.map(msgId => [userId, msgId]);

    await db.query(
      "INSERT IGNORE INTO user_hidden_messages (user_id, message_id) VALUES ?",
      [values]
    );

    res.status(200).json({ success: true, hiddenIds: messageIds });
  } catch (err) {
    console.error("Error hiding messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Route: GET /api/messages/hidden/hidden - Fetch hidden message IDs
exports.getHiddenMessageIds = async (req, res) => {
  console.log("👤 req.user in hiddenMessagesController:", req.user);
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      'SELECT message_id FROM user_hidden_messages WHERE user_id = ?',
      [userId]
    );

    const hiddenMessageIds = rows.map(r => r.message_id);
    res.status(200).json({ hiddenMessageIds });
  } catch (err) {
    console.error('Error fetching hidden messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
