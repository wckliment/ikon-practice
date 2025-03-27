const OpenDentalService = require('../services/openDentalService');
const db = require('../config/db');

// This middleware initializes the Open Dental service
// without modifying existing authentication
const initializeOpenDental = async (req, res, next) => {
  try {
    // We expect req.user to be set by your existing authentication middleware
    if (!req.user || !req.user.locationId) {
      return res.status(400).json({
        success: false,
        error: 'User must be authenticated and have a location to access appointment data'
      });
    }

    // Get location details from database
    const [locations] = await db.execute(
      'SELECT * FROM locations WHERE id = ?',
      [req.user.locationId]
    );

    if (locations.length === 0 || !locations[0].developer_key || !locations[0].customer_key) {
      return res.status(400).json({
        success: false,
        error: 'No Open Dental configuration found for this location'
      });
    }

    // Attach Open Dental service to request
    req.openDentalService = new OpenDentalService(
      locations[0].developer_key,
      locations[0].customer_key
    );

    next();
  } catch (error) {
    console.error('Failed to initialize Open Dental service:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error initializing Open Dental service'
    });
  }
};

module.exports = {
  initializeOpenDental
};
