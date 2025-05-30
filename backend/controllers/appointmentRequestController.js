const AppointmentRequest = require('../models/appointmentRequestModel');
const AppointmentRequestNote = require('../models/appointmentRequestNoteModel');
const socket = require('../socket');
const db = require('../config/db');

exports.createAppointmentRequest = async (req, res) => {
  try {
    const data = req.body;

    const preferredTime = new Date(data.preferred_time);
    if (isNaN(preferredTime)) {
      return res.status(400).json({ error: 'Invalid preferred_time format' });
    }
    data.preferred_time = preferredTime.toISOString().slice(0, 19).replace('T', ' ');

    console.log('📩 Incoming appointment request:', data);

    const id = await AppointmentRequest.create(data);

    // ✅ NOW safely get socket after initialization
    const io = socket.getIO();
    io.emit("newAppointmentRequest", { id, ...data });

    res.status(201).json({ id });
  } catch (err) {
    console.error('❌ Error creating appointment request:', err);
    res.status(500).json({ error: 'Failed to create appointment request' });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { patient_type } = req.query;

    let sql = "SELECT * FROM appointment_requests";
    const params = [];

    if (patient_type) {
      sql += " WHERE patient_type = ?";
      params.push(patient_type);
    }

    const [requests] = await db.execute(sql, params);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching appointment requests:', err);
    res.status(500).json({ error: 'Failed to fetch appointment requests' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, handled_by, staff_notes } = req.body;

  try {
    await AppointmentRequest.updateStatus(id, status, handled_by);

    if (staff_notes && staff_notes.trim() !== "") {
      await AppointmentRequestNote.createNote({
        appointment_request_id: id,
        user_id: handled_by,
        note_text: staff_notes,
      });

      // ✅ Mark as having notes
      await db.execute(
        `UPDATE appointment_requests SET has_staff_notes = true WHERE id = ?`,
        [id]
      );
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('Error updating appointment request:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
};


exports.addNote = async (req, res) => {
  const { id } = req.params;
  const { user_id, note_text } = req.body;

  try {
    await db.execute(
      `INSERT INTO appointment_request_notes (appointment_request_id, user_id, note_text)
       VALUES (?, ?, ?)`,
      [id, user_id, note_text]
    );

    await db.execute(
      `UPDATE appointment_requests SET has_staff_notes = true WHERE id = ?`,
      [id]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error("❌ Error adding note:", err);
    res.status(500).json({ error: "Failed to add note" });
  }
};

exports.getRequestNotes = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT arn.id, arn.note_text, arn.created_at, u.id AS user_id, u.name AS user_name
       FROM appointment_request_notes arn
       JOIN users u ON arn.user_id = u.id
       WHERE arn.appointment_request_id = ?
       ORDER BY arn.created_at ASC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch staff notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

exports.linkPatientToRequest = async (req, res) => {
  const { id } = req.params;
  const { patient_id } = req.body;

  if (!patient_id) {
    return res.status(400).json({ error: "Missing patient_id" });
  }

  try {
    await db.execute(
      'UPDATE appointment_requests SET patient_id = ? WHERE id = ?',
      [patient_id, id]
    );

    res.status(200).json({ message: 'Successfully linked appointment request to patient' });
  } catch (err) {
    console.error("❌ Failed to link patient_id:", err);
    res.status(500).json({ error: "Failed to link patient_id" });
  }
};
