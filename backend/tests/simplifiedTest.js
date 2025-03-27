const axios = require('axios');
require('dotenv').config();

// Set the environment to test
process.env.NODE_ENV = 'test';

// Create a JWT token manually for testing
function createTestToken() {
  const jwt = require('jsonwebtoken');
  // Create a token for user ID 26 with location ID 6
  return jwt.sign(
    { userId: 26, locationId: 6, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Test the appointments API
async function testAppointmentsAPI() {
  console.log('===== Testing Appointments API =====');

  try {
    const token = createTestToken();
    console.log('Created test token for user ID 26, location ID 6');

    // Create axios instance with auth header
    const api = axios.create({
      baseURL: 'http://localhost:5000',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Test GET /api/appointments
    console.log('Testing GET /api/appointments...');

    // Set up date parameters
    const today = new Date();
    const inOneMonth = new Date();
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);

    const params = {
      startDate: today.toISOString().split('T')[0],
      endDate: inOneMonth.toISOString().split('T')[0]
    };

    console.log('Request params:', params);

    try {
      const response = await api.get('/api/appointments', { params });
      console.log(`Success! Status: ${response.status}`);
      console.log(`Data: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } catch (error) {
      console.error('API call failed:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      return false;
    }
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test
testAppointmentsAPI()
  .then(success => {
    console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error running test:', error);
    process.exit(1);
  });
