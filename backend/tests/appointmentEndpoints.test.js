const axios = require('axios');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

async function testAppointmentEndpoints() {
  console.log('===== Testing Appointment Endpoints =====');

  try {
    // Get a valid user - specifically user ID 26
    console.log('Querying database for user ID 26...');
    const result = await db.execute(
      'SELECT * FROM users WHERE id = 26 LIMIT 1'
    );

    console.log('Database query result structure:', JSON.stringify(result, null, 2));

    // MySQL returns [rows, fields], so we need to access the rows
    const users = result[0];
    console.log('Found users:', users.length);

    if (users.length === 0) {
      console.error('User ID 26 not found');
      return false;
    }

    const user = users[0];
    console.log(`Testing with user ID: ${user.id}, location ID: ${user.location_id}`);

    if (!user.location_id) {
      console.error('User does not have a location_id');
      return false;
    }

    // Get JWT token
    console.log('Creating JWT token...');
    const payload = {
      userId: user.id,
      locationId: user.location_id,
      role: user.role || 'admin'
    };
    console.log('Token payload:', payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token created successfully');

    // Create axios instance with auth header
    const api = axios.create({
      baseURL: 'http://localhost:5000',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Test 1: GET /api/appointments
    console.log('Testing GET /api/appointments...');
    try {
      // Set up date parameters
      const today = new Date();
      const inOneMonth = new Date();
      inOneMonth.setMonth(inOneMonth.getMonth() + 1);

      const params = {
        startDate: today.toISOString().split('T')[0],
        endDate: inOneMonth.toISOString().split('T')[0]
      };

      console.log('Request params:', params);
      console.log('Request URL: /api/appointments');

      const response = await api.get('/api/appointments', { params });

      console.log(`Successfully called appointments endpoint. Response status: ${response.status}`);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      // If we have appointments, grab the first one's ID for the next test
      if (response.data.data && response.data.data.length > 0) {
        const appointmentId = response.data.data[0].id;
        console.log(`Found appointment ID for next test: ${appointmentId}`);

        // Test 2: GET /api/appointments/:id
        console.log(`Testing GET /api/appointments/${appointmentId}...`);
        try {
          const detailResponse = await api.get(`/api/appointments/${appointmentId}`);
          console.log(`Successfully retrieved appointment details. Response status: ${detailResponse.status}`);
          console.log('Appointment details:', JSON.stringify(detailResponse.data, null, 2));

          // Test 3: PATCH /api/appointments/:id/extension
          console.log(`Testing PATCH /api/appointments/${appointmentId}/extension...`);
          try {
            const updateData = {
              customTags: ['test-tag', 'api-testing'],
              internalNotes: 'This is a test note created by the automated test',
              followupRequired: true,
              followupDate: new Date().toISOString()
            };

            console.log('Update data:', updateData);

            const extensionResponse = await api.patch(
              `/api/appointments/${appointmentId}/extension`,
              updateData
            );

            console.log(`Successfully updated appointment extension. Response status: ${extensionResponse.status}`);
            console.log('Update response:', JSON.stringify(extensionResponse.data, null, 2));

            return true;
          } catch (error) {
            console.error('Failed to update appointment extension:', error.message);
            console.error('Full error:', error);
          }
        } catch (error) {
          console.error('Failed to get appointment details:', error.message);
          console.error('Full error:', error);
        }
      } else {
        console.log('No appointments returned from the API. This might be expected with test data.');
      }

      return true;
    } catch (error) {
      console.error('Failed to get appointments:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
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
  // Make sure environment variables are loaded
  require('dotenv').config();

  testAppointmentEndpoints()
    .then(success => {
      console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error running test:', error);
      process.exit(1);
    });
}

module.exports = testAppointmentEndpoints;
