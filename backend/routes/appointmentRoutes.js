// backend/routes/appointmentsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  updateAppointmentExtension,
  createAppointment,
  updateAppointment,
  getAppointmentProcedures,
  updateProcedure
} = require('../controllers/appointmentsController');
const authenticateUser = require('../middleware/authMiddleware');
const { initializeOpenDental } = require('../middleware/appointmentMiddleware');
const { testInitializeOpenDental } = require('../middleware/testAppointmentMiddleware');

// Use environment variable to determine which middleware to use
const useTestMiddleware = process.env.NODE_ENV === 'test';

// First use your existing authentication middleware
router.use(authenticateUser);

// Then use the appropriate Open Dental initialization middleware
if (useTestMiddleware) {
  router.use(testInitializeOpenDental);
} else {
  router.use(initializeOpenDental);
}

// Define routes
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.patch('/:appointmentId/extension', updateAppointmentExtension);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.get('/:id/procedures', getAppointmentProcedures);
router.put('/procedurelogs/:procNum', updateProcedure);
module.exports = router;
