const OpenDentalService = require('../services/openDentalService');
const db = require('../config/db');

const initializeOpenDental = async (req, res, next) => {
  try {
    console.log('Initialize Open Dental middleware - starting');

    if (!req.user) {
      console.log('User not found in request');
      return res.status(400).json({
        success: false,
        error: 'User authentication required'
      });
    }

    console.log('User found in request:', req.user);

    if (!req.user.location_id) {
      console.log('No location_id found in user object');
      return res.status(400).json({
        success: false,
        error: 'User must have a location ID to access appointment data'
      });
    }

    console.log(`Fetching location data for ID: ${req.user.location_id}`);

    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [req.user.location_id]);

    console.log('Query results:', rows);

    if (!rows || rows.length === 0) {
      console.log('No location found with the given ID');
      return res.status(400).json({
        success: false,
        error: 'Location not found'
      });
    }

    const location = rows[0];
    

    if (!location.developer_key || !location.customer_key) {
      console.log('Missing keys in location record');
      return res.status(400).json({
        success: false,
        error: 'Location is missing Open Dental API credentials'
      });
    }

    // Attach Open Dental service to request
    console.log('Initializing OpenDentalService...');
    req.openDentalService = new OpenDentalService(
      location.developer_key,
      location.customer_key
    );

    console.log('OpenDentalService initialized successfully');
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
