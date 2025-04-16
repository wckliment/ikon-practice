const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const OpenDentalService = require("../services/openDentalService");
const { getKeysFromLocation, getLocationCodeById } = require("../utils/locationUtils");
const { sendSystemMessage } = require("../utils/systemMessaging");


exports.tabletLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("📥 Login attempt from tablet:", email);

    const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔍 Get location code from the locations table
    const [[location]] = await db.query(
      "SELECT code FROM locations WHERE id = ?",
      [user.location_id]
    );

    const token = jwt.sign(
      { userId: user.id, location_id: user.location_id },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location_id: user.location_id,
        location_code: location?.code || null, // ✅ Include code here
      },
    });
  } catch (err) {
    console.error("❌ Tablet login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.patientLookup = async (req, res) => {
  const { firstName, lastName, dob, locationCode } = req.body;

  try {
    // Get API keys from your locations table
    const { devKey, custKey } = await getKeysFromLocation(locationCode);

    // Instantiate OD service with keys
    const openDentalService = new OpenDentalService(devKey, custKey);

    // 1. Find patient
    const patient = await openDentalService.findPatientByNameAndDOB(
      firstName,
      lastName,
      dob
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

   // 2. Get the next upcoming appointment
  const appointment = await openDentalService.getNextAppointmentForPatient(patient.PatNum);

if (!appointment) {
  return res.status(404).json({ message: "No upcoming appointment found." });
}

    // 3. Return both
    res.json({ patient, appointment });

  } catch (err) {
    console.error("Tablet patient lookup error:", err);
    res.status(500).json({ message: "Server error during patient lookup." });
  }
};

exports.sendTabletCheckInMessage = async (req, res, io) => {
  try {
    const { patient, appointment } = req.body;
    const locationId = req.user.location_id;

    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDentalService = new OpenDentalService(devKey, custKey);

    // ✅ 1. Update confirmation status in Open Dental
    const updatedAppointment = await openDentalService.updateAppointment(appointment.id, {
      Confirmed: 22, // "Arrived"
    });

    console.log("✅ Confirmation status updated:", updatedAppointment.Confirmed);

    // ✅ 2. Emit to refresh frontend calendar
io.emit("appointmentUpdated", { id: updatedAppointment.id });

    // ✅ 2. Send real-time broadcast message
    const time = new Date(appointment.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageText = `Patient ${patient.FName} ${patient.LName} has checked in for their ${time} appointment with Dr. ${appointment.providerName}`;

    // 👇 pass io here
    const message = await sendSystemMessage(io, messageText, locationId);

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("❌ Failed to check in patient:", error);
    res.status(500).json({ error: "Failed to check in patient" });
  }
};
