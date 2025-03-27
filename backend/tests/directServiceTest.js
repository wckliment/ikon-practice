const axios = require('axios');
require('dotenv').config();

async function testOpenDentalDirectly() {
  console.log('===== Testing OpenDental API Directly =====');

  try {
    // Your Open Dental credentials
    const developerKey = 'wmOlQPFzPER6YasT';
    const customerKey = 'b2n8TVS5k1xdpkI1';

    console.log('Setting up direct API request with credentials');

    // Create headers matching your successful Postman request
    const headers = {
      'Authorization': `ODFHIR ${developerKey}/${customerKey}`
    };

    // Make a direct API request to Open Dental
    console.log('Making direct API request to Open Dental...');
    try {
      const response = await axios.get(
        'https://api.opendental.com/api/v1/appointments',
        { headers }
      );

      console.log(`Success! Status: ${response.status}`);
      console.log(`Received ${response.data.length} appointments`);

      if (response.data.length > 0) {
        console.log('First appointment:', JSON.stringify(response.data[0], null, 2));
      } else {
        console.log('No appointments found');
      }

      return true;
    } catch (apiError) {
      console.error('Error calling Open Dental API directly:', apiError.message);
      if (apiError.response) {
        console.error('API response status:', apiError.response.status);
        console.error('API response data:', apiError.response.data);
      } else {
        console.error('No response received, full error:', apiError);
      }
      return false;
    }
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test
testOpenDentalDirectly()
  .then(success => {
    console.log(`Direct API test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error running test:', error);
    process.exit(1);
  });
