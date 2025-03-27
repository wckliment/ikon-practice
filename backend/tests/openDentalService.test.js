const OpenDentalService = require('../services/openDentalService');
const db = require('../config/db');

async function testOpenDentalService() {
  console.log('===== Testing OpenDentalService =====');

  try {
    // Get credentials from your database
    console.log('Querying database for location ID 6...');
    const result = await db.execute(
      'SELECT * FROM locations WHERE id = 6 LIMIT 1'
    );

    console.log('Database query result structure:', JSON.stringify(result, null, 2));

    // MySQL returns [rows, fields], so we need to access the rows
    const locations = result[0];
    console.log('Found locations:', locations.length);

    if (locations.length === 0) {
      console.error('No location found with ID 6');
      return false;
    }

    const location = locations[0];
    console.log(`Found location: ${location.id}`);

    if (!location.developer_key || !location.customer_key) {
      console.error('Location is missing developer_key or customer_key');
      return false;
    }

    console.log('Developer key exists:', !!location.developer_key);
    console.log('Customer key exists:', !!location.customer_key);

    // Initialize service
    const service = new OpenDentalService(location.developer_key, location.customer_key);
    console.log('Successfully initialized OpenDentalService');

    // Test date formatting
    const today = new Date();
    const formatted = service._formatDate(today);
    console.log(`Date formatting test: ${today} -> ${formatted}`);

    // Try to fetch appointments
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      console.log('Attempting to fetch appointments...');
      console.log(`Date range: ${service._formatDate(twoWeeksAgo)} to ${service._formatDate(twoWeeksFromNow)}`);

      const appointments = await service.getAppointments(twoWeeksAgo, twoWeeksFromNow);

      console.log(`Successfully fetched ${appointments.length} appointments`);
      if (appointments.length > 0) {
        console.log('Sample appointment:', JSON.stringify(appointments[0], null, 2));
      }

      return true;
    } catch (error) {
      console.error('Failed to fetch appointments. This might be expected if using test credentials.');
      console.error('Error details:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOpenDentalService()
    .then(success => {
      console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error running test:', error);
      process.exit(1);
    });
}

module.exports = testOpenDentalService;
