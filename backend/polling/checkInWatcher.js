const db = require('../config/db');
const OpenDentalService = require('../services/openDentalService');
const { sendSystemMessage } = require('../utils/systemMessaging');

const READY_TO_GO_BACK_CODE = 23;
const previousStatusesByLocation = {};

const pollForCheckInUpdates = async (locationId) => {
  console.log(`🔍 Polling check-ins for location ${locationId}...`);

  try {
    // Step 1: Get Open Dental credentials for this location
    const [locationRows] = await db.query(
      'SELECT customer_key, developer_key FROM locations WHERE id = ?',
      [locationId]
    );

    if (!locationRows.length) {
      console.error(`❌ No Open Dental credentials found for location ID: ${locationId}`);
      return;
    }

    const { customer_key: customerKey, developer_key: developerKey } = locationRows[0];
    const openDental = new OpenDentalService(developerKey, customerKey);

    // Step 2: Get today's appointments
    const today = new Date();
    const appointments = await openDental.getAppointments(today, today);

    if (!previousStatusesByLocation[locationId]) {
      previousStatusesByLocation[locationId] = {};
    }

   for (const apt of appointments) {
  const { id: AptNum, patientId: PatNum, Confirmed } = apt;

  // Add detailed logging for each appointment
  console.log(`📊 Appointment ${AptNum}: Patient=${PatNum}, Status=${Confirmed}, Previous=${previousStatusesByLocation[locationId][AptNum] || 'none'}`);

  const prevStatus = previousStatusesByLocation[locationId][AptNum];

  // Log specifically when detecting status 23
  if (Confirmed === READY_TO_GO_BACK_CODE) {
    console.log(`🎯 Found appointment with READY_TO_GO_BACK status (${READY_TO_GO_BACK_CODE}): AptNum=${AptNum}, PatNum=${PatNum}`);
  }

  // This is the key condition check
  if (prevStatus !== Confirmed && Confirmed === READY_TO_GO_BACK_CODE) {
    console.log(`✨ Status change detected: from ${prevStatus} to ${Confirmed} (READY_TO_GO_BACK_CODE=${READY_TO_GO_BACK_CODE})`);

    try {
      const patient = await openDental.getPatient(PatNum);
      console.log(`🧑 Patient info retrieved: ${patient.FName} ${patient.LName}`);

      const message = `🦷 ${patient.FName} ${patient.LName} has checked in and is ready to go back.`;
      console.log(`📝 Creating system message: "${message}"`);

      const result = await sendSystemMessage(message, locationId);
      console.log(`✅ [${locationId}] Auto-message sent: ${message}, result:`, result);
    } catch (error) {
      console.error(`❌ Error processing ready-to-go-back status for appointment ${AptNum}:`, error);
    }
  }

  previousStatusesByLocation[locationId][AptNum] = Confirmed;
}
  } catch (error) {
    console.error(`❌ Error polling check-ins for location ${locationId}:`, error.message);
  }
};

module.exports = pollForCheckInUpdates;
