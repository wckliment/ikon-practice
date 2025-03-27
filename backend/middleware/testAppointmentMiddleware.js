const OpenDentalService = require('../services/openDentalService');

// This is a test middleware that uses hard-coded credentials
const testInitializeOpenDental = async (req, res, next) => {
  try {
    console.log('Test Initialize Open Dental middleware - starting');

    // Hard-coded credentials for testing
    const developerKey = ''; // Add your Open Dental developer key here
    const customerKey = ''; // Add your Open Dental customer key here

    if (!developerKey || !customerKey) {
      console.log('Missing hard-coded credentials');
      return res.status(400).json({
        success: false,
        error: 'Test credentials not configured'
      });
    }

    // Attach Open Dental service to request
    console.log('Initializing test OpenDentalService...');
    req.openDentalService = new OpenDentalService(developerKey, customerKey);
    console.log('Test OpenDentalService initialized successfully');

    next();
  } catch (error) {
    console.error('Failed to initialize test Open Dental service:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error initializing test Open Dental service'
    });
  }
};

module.exports = {
  testInitializeOpenDental
};
