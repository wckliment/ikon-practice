const db = require('../config/db');

const AppointmentRequestNote = {
  createNote: async ({ appointment_request_id, user_id, note_text }) => {
    await db.execute(
      `INSERT INTO appointment_request_notes (appointment_request_id, user_id, note_text)
       VALUES (?, ?, ?)`,
      [appointment_request_id, user_id, note_text]
    );
  },

  getNotesForRequest: async (appointmentRequestId) => {
    const [rows] = await db.execute(
      `SELECT n.id, n.note_text, n.created_at, u.name AS user_name
       FROM appointment_request_notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.appointment_request_id = ?
       ORDER BY n.created_at DESC`,
      [appointmentRequestId]
    );
    return rows;
  },
};

module.exports = AppointmentRequestNote;
