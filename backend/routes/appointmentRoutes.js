const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  updateAppointmentExtension
} = require('../controllers/appointmentsController');
const authenticateUser = require('../middleware/authMiddleware');
const { initializeOpenDental } = require('../middleware/appointmentMiddleware');

// First use your existing authentication middleware
router.use(authenticateUser);

// Then use the Open Dental initialization middleware
router.use(initializeOpenDental);

// Define routes
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.patch('/:appointmentId/extension', updateAppointmentExtension);

module.exports = router;
