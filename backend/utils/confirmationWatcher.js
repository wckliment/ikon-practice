const { sendSystemMessage } = require('../utils/systemMessaging');

// In-memory store to track previous statuses
let previousConfirmationStatuses = {};

const POLL_INTERVAL_MS = 10000;
const READY_TO_GO_BACK_CODE = 23;

async function pollAppointments(io, openDentalService) {
  try {
    const appointments = await openDentalService.getTodayAppointments();

    if (!Array.isArray(appointments)) {
      console.error('❌ Error: Expected an array of appointments but got:', appointments);
      return;
    }

    // console.log(`📅 Fetched ${appointments.length} appointments from Open Dental`);

    for (const apt of appointments) {
      const aptId = apt.AptNum || apt.id;
      const rawDate = apt.AptDateTime || apt.startTime;

      // if no appointment ID, skip
      if (!aptId) {
        console.warn("⚠️ Skipping appointment with missing AptNum:", apt);
        continue;
      }

      const currentStatus = apt.Confirmed;
      const previousStatus = previousConfirmationStatuses[aptId];

      if (previousStatus === undefined) {
        previousConfirmationStatuses[aptId] = currentStatus;
        continue;
      }

      // console.log(`🔁 Checking Apt ${aptId}: Prev ${previousStatus} → Curr ${currentStatus}`);

      if (
        previousStatus !== READY_TO_GO_BACK_CODE &&
        currentStatus === READY_TO_GO_BACK_CODE
      ) {
        console.log(`🎯 Appointment ${aptId} is now READY TO GO BACK!`);

        const [patient, provider] = await Promise.all([
          openDentalService.getPatient(apt.PatNum || apt.patientId),
          openDentalService.getProviders().then((provList) =>
            provList.find((p) => p.ProvNum === (apt.ProvNum || apt.providerId))
          )
        ]);

        const patientName = patient ? `${patient.FName || ''} ${patient.LName || ''}`.trim() : `Patient #${apt.PatNum || apt.patientId}`;
        const doctorName = provider ? `${provider.FName || ''} ${provider.LName || ''}`.trim() : `Provider #${apt.ProvNum || apt.providerId}`;

        const appointmentTime = rawDate
          ? new Date(rawDate).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'an upcoming';

        const message = `Patient ${patientName} is ready to go back for their ${appointmentTime} appointment with Dr. ${doctorName}`;

        console.log("📨 Emitting 'ready-to-go-back' system message...");
        console.log("🧑‍⚕️ Message Preview:", message);

        await sendSystemMessage(io, {
          message,
          type: 'ready-to-go-back',
          locationId: apt.LocationNum || apt.locationId || null,
        });

        console.log("✅ Emitted 'ready-to-go-back' system message");
      }

      previousConfirmationStatuses[aptId] = currentStatus;
    }
  } catch (error) {
    console.error("❌ Error polling appointments:", error.message || error);
  }
}

function startConfirmationWatcher(io, openDentalService) {
  console.log("🕒 Starting confirmation watcher...");
  setInterval(() => pollAppointments(io, openDentalService), POLL_INTERVAL_MS);
}

module.exports = startConfirmationWatcher;
