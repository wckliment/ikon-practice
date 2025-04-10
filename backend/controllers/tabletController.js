const OpenDentalService = require("../services/openDentalService");
const { getKeysFromLocation } = require("../utils/locationUtils");
const { getLocationIdByCode } = require("../utils/locationUtils");
const { sendSystemMessage } = require("../utils/systemMessaging");

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

    // 2. Get today's appointment
    const appointment = await openDentalService.getTodayAppointmentForPatient(patient.PatNum);

    if (!appointment) {
      return res.status(404).json({ message: "No appointment found for today." });
    }

    // 3. Return both
    res.json({ patient, appointment });

  } catch (err) {
    console.error("Tablet patient lookup error:", err);
    res.status(500).json({ message: "Server error during patient lookup." });
  }
};

exports.sendTabletCheckInMessage = async (req, res) => {
  try {
    const { patient, appointment, locationCode } = req.body;

    const locationId = await getLocationIdByCode(locationCode);

    const time = new Date(appointment.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageText = `Patient ${patient.FName} ${patient.LName} has checked in for their ${time} appointment with Dr. ${appointment.providerName}`;

    const message = await sendSystemMessage(messageText, locationId);

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("❌ Failed to send tablet check-in message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
