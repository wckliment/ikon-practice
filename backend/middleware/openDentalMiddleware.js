const OpenDentalService = require('../services/openDentalService');
const db = require('../config/db');

const attachOpenDentalService = async (req, res, next) => {
  try {
    // Ensure user is authenticated and has a location
    if (!req.user || !req.user.locationId) {
      return next();
    }

    // Get location details from database
    const [locations] = await db.execute(
      'SELECT * FROM locations WHERE id = ?',
      [req.user.locationId]
    );

    if (locations.length === 0 || !locations[0].developer_key || !locations[0].customer_key) {
      return next();
    }

    // Attach Open Dental service to request
    req.openDentalService = new OpenDentalService(
      locations[0].developer_key,
      locations[0].customer_key
    );

    next();
  } catch (error) {
    console.error('Failed to initialize Open Dental service:', error);
    next(error);
  }
};

module.exports = {
  attachOpenDentalService
};
