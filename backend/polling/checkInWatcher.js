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
      const prevStatus = previousStatusesByLocation[locationId][AptNum];

      if (prevStatus !== Confirmed && Confirmed === READY_TO_GO_BACK_CODE) {
        const patient = await openDental.getPatient(PatNum);
        const message = `🦷 ${patient.FName} ${patient.LName} has checked in and is ready to go back.`;

        await sendSystemMessage(message, locationId);
        console.log(`✅ [${locationId}] Auto-message sent: ${message}`);
      }

      previousStatusesByLocation[locationId][AptNum] = Confirmed;
    }
  } catch (error) {
    console.error(`❌ Error polling check-ins for location ${locationId}:`, error.message);
  }
};

module.exports = pollForCheckInUpdates;
