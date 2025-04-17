const axios = require('axios');

let previousConfirmationStatuses = {};

const POLL_INTERVAL_MS = 10000; // 10 seconds
const READY_TO_GO_BACK_CODE = 23;

async function pollAppointments(io, openDentalService) {
  try {
    const appointments = await openDentalService.getTodayAppointments(); // you'll define this

    for (const apt of appointments) {
      const aptId = apt.AptNum;

      const currentStatus = apt.Confirmed;
      const previousStatus = previousConfirmationStatuses[aptId];

      if (
        previousStatus !== READY_TO_GO_BACK_CODE &&
        currentStatus === READY_TO_GO_BACK_CODE
      ) {
        console.log(`🎯 Appointment ${aptId} is now READY TO GO BACK!`);

        // Send WebSocket broadcast
        io.emit('newMessage', {
          id: `sys-${aptId}-${Date.now()}`,
          message: `${apt.PatName || 'A patient'} is ready to go back.`,
          type: 'patient-check-in',
          is_system: true,
          created_at: new Date().toISOString(),
          receiver_id: null,
          sender_name: 'System'
        });
      }

      // Update memory
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
