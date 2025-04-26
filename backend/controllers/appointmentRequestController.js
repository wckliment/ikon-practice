const AppointmentRequest = require('../models/appointmentRequestModel');
const socket = require('../socket');

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
    const requests = await AppointmentRequest.getAll();
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
    await AppointmentRequest.updateStatus(id, status, handled_by, staff_notes);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error updating appointment request:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
};
