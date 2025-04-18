const { sendSystemMessage } = require('../utils/systemMessaging');

let previousConfirmationStatuses = {};

const POLL_INTERVAL_MS = 10000;
const READY_TO_GO_BACK_CODE = 23;

async function pollAppointments(io, openDentalService) {
  try {
    const appointments = await openDentalService.getTodayAppointments();

    for (const apt of appointments) {
      const aptId = apt.AptNum || apt.id;

      // 🛑 Skip if missing ID
      if (!aptId) {
        console.warn("⚠️ Skipping appointment with missing AptNum:", apt);
        continue;
      }

      const currentStatus = apt.Confirmed;
      const previousStatus = previousConfirmationStatuses[aptId];

      // 🧠 First-time seen — store but don’t broadcast
      if (previousStatus === undefined) {
        previousConfirmationStatuses[aptId] = currentStatus;
        continue;
      }

      // ✅ Only emit when changing to READY
      if (
        previousStatus !== READY_TO_GO_BACK_CODE &&
        currentStatus === READY_TO_GO_BACK_CODE
      ) {
        console.log(`🎯 Appointment ${aptId} is now READY TO GO BACK!`);

        // ✅ Use shared system message util
        await sendSystemMessage(io, {
          message: `${apt.PatientName || 'A patient'} is ready to go back.`,
          type: 'ready-to-go-back'
        });
      }

      // 🧹 Always update memory
      previousConfirmationStatuses[aptId] = currentStatus;
    }
  } catch (error) {
    console.error("❌ Error polling appointments:", error.message);
  }
}

function startConfirmationWatcher(io, openDentalService) {
  console.log("🕒 Starting confirmation watcher...");
  setInterval(() => pollAppointments(io, openDentalService), POLL_INTERVAL_MS);
}

module.exports = startConfirmationWatcher;
