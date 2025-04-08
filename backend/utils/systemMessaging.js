const db = require('../config/db');
const { getIO } = require('../socket');

const SYSTEM_USER_ID = 31;
const MESSAGE_TYPE = 'patient-check-in';

const sendSystemMessage = async (text, locationId) => {
  const sql = `
    INSERT INTO messages (sender_id, message, type, is_system, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const [result] = await db.query(sql, [SYSTEM_USER_ID, text, MESSAGE_TYPE, true]);

  const newMessage = {
    id: result.insertId,
    sender_id: SYSTEM_USER_ID,
    receiver_id: null,
    message: text,
    type: MESSAGE_TYPE,
    is_system: true,
    created_at: new Date(),
  };

  // ✅ Emit to all users (or a specific room if you want to scope by location)
  const io = getIO();
  io.emit("newMessage", newMessage); // or io.to(`location-${locationId}`).emit(...)

  return newMessage;
};

module.exports = { sendSystemMessage };
