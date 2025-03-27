// backend/tests/runTests.js
require('dotenv').config();

const testOpenDentalService = require('./openDentalService.test');
const testAppointmentEndpoints = require('./appointmentEndpoints.test');

async function runAllTests() {
  console.log('======================================');
  console.log('Starting Open Dental Integration Tests');
  console.log('======================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: OpenDentalService
  if (await testOpenDentalService()) {
    console.log('✅ OpenDentalService Test PASSED\n');
    passed++;
  } else {
    console.log('❌ OpenDentalService Test FAILED\n');
    failed++;
  }

  // Test 2: Appointment Endpoints
  if (await testAppointmentEndpoints()) {
    console.log('✅ Appointment Endpoints Test PASSED\n');
    passed++;
  } else {
    console.log('❌ Appointment Endpoints Test FAILED\n');
    failed++;
  }

  // Summary
  console.log('======================================');
  console.log(`Test Summary: ${passed} passed, ${failed} failed`);
  console.log('======================================');

  return failed === 0;
}

// Run all tests
runAllTests()
  .then(success => {
    console.log(`Overall test result: ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
