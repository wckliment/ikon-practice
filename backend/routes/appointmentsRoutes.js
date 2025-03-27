const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  updateAppointmentExtension
} = require('../controllers/appointmentsController');
const { protect } = require('../middleware/authMiddleware');
const { attachOpenDentalService } = require('../middleware/openDentalMiddleware');

// Apply middleware to all appointment routes
router.use(protect); // Ensure user is authenticated
router.use(attachOpenDentalService); // Attach Open Dental service

// Define routes
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.patch('/:appointmentId/extension', updateAppointmentExtension);

module.exports = router;
