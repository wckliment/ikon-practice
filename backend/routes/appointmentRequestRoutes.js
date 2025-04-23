const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointmentRequestController');

router.post('/', controller.createAppointmentRequest);         // Public-facing API
router.get('/', controller.getAllRequests);                    // Staff view in ikonPractice
router.put('/:id/status', controller.updateRequestStatus);     // Update status (e.g., contacted/scheduled)

module.exports = router;
