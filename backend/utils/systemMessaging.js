const db = require('../config/db');
const { getIO } = require('../socket');

const SYSTEM_USER_ID = 31;
const MESSAGE_TYPE = 'patient-check-in';

const sendSystemMessage = async (io, { message, type = 'patient-check-in', locationId = null }) => {
  const sql = `
    INSERT INTO messages (sender_id, message, type, is_system, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const [result] = await db.query(sql, [SYSTEM_USER_ID, message, type, true]);

  const newMessage = {
    id: result.insertId,
    sender_id: SYSTEM_USER_ID,
    receiver_id: null,
    message,
    type,
    is_system: true,
    created_at: new Date(),
  };

  io.emit("newMessage", newMessage);

  return newMessage;
};

module.exports = { sendSystemMessage };
