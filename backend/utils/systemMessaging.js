const db = require('../config/db');

const SYSTEM_USER_ID = 31;
const MESSAGE_TYPE = 'patient-check-in';

const sendSystemMessage = async (text) => {
  const sql = `
    INSERT INTO messages (sender_id, message, type, is_system, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  await db.query(sql, [SYSTEM_USER_ID, text, MESSAGE_TYPE, true]);
};

module.exports = { sendSystemMessage };
