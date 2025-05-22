const db = require('../config/db');

const AppointmentRequest = {
  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO appointment_requests
        (name, dob, phone, email, appointment_type, preferred_time, notes, patient_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.dob,
        data.phone,
        data.email,
        data.appointment_type,
        data.preferred_time,
        data.notes,
        data.patient_type,
      ]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.execute(
      `SELECT * FROM appointment_requests ORDER BY created_at DESC`
    );
    return rows;
  },

updateStatus: async (id, status, handled_by = null) => {
  await db.execute(
    `UPDATE appointment_requests
     SET status = ?, handled_by = ?
     WHERE id = ?`,
    [status, handled_by, id]
  );
},
};

module.exports = AppointmentRequest;
