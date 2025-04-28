const db = require("../config/db");

exports.createNote = async (req, res) => {
  const { appointmentRequestId, userId, noteText } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO notes (appointment_request_id, user_id, note_text) VALUES (?, ?, ?)`,
      [appointmentRequestId, userId, noteText]
    );

    res.status(201).json({ id: result.insertId, appointmentRequestId, userId, noteText, createdAt: new Date() });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

exports.getNotesByAppointmentRequest = async (req, res) => {
  const { appointmentRequestId } = req.params;

  try {
    const [notes] = await db.execute(
      `SELECT n.id, n.note_text, n.created_at, u.name AS user_name
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.appointment_request_id = ?
       ORDER BY n.created_at ASC`,
      [appointmentRequestId]
    );

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};
