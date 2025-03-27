// backend/middleware/appointmentMiddleware.js
const OpenDentalService = require('../services/openDentalService');
const db = require('../config/db');

// This middleware initializes the Open Dental service
const initializeOpenDental = async (req, res, next) => {
  try {
    console.log('Initialize Open Dental middleware - starting');

    // We expect req.user to be set by your existing authentication middleware
    if (!req.user) {
      console.log('User not found in request');
      return res.status(400).json({
        success: false,
        error: 'User authentication required'
      });
    }

    console.log('User found in request:', req.user);

    if (!req.user.locationId) {
      console.log('No locationId found in user object');
      return res.status(400).json({
        success: false,
        error: 'User must have a location ID to access appointment data'
      });
    }

    console.log(`Fetching location data for ID: ${req.user.locationId}`);

    // Get location details from database
    try {
      const [locations] = await db.execute(
        'SELECT * FROM locations WHERE id = ?',
        [req.user.locationId]
      );

      console.log(`Query results: found ${locations.length} locations`);

      if (locations.length === 0) {
        console.log('No location found with the given ID');
        return res.status(400).json({
          success: false,
          error: 'Location not found'
        });
      }

      const location = locations[0];
      console.log(`Location found: ${location.id}, has developer_key: ${!!location.developer_key}, has customer_key: ${!!location.customer_key}`);

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
    } catch (dbError) {
      console.error('Database error fetching location:', dbError);
      res.status(500).json({ 
        success: false,
        error: 'Database error fetching location information'
      });
    }
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
