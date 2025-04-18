const startConfirmationWatcher = require("./confirmationWatcher");
const { getKeysFromLocation } = require("./locationUtils");
const OpenDentalService = require("../services/openDentalService");

const activeWatchers = {}; 

async function ensureWatcherRunningForLocation(locationCode, io) {
  if (activeWatchers[locationCode]) return; // already running

  try {
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDentalService = new OpenDentalService(devKey, custKey);

    startConfirmationWatcher(io, openDentalService, locationCode);
    activeWatchers[locationCode] = true;

    console.log(`📡 Started confirmation watcher for location: ${locationCode}`);
  } catch (err) {
    console.error(`❌ Failed to start watcher for ${locationCode}:`, err.message);
  }
}

module.exports = {
  ensureWatcherRunningForLocation,
};
