const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointmentRequestController');

router.post('/', controller.createAppointmentRequest);
router.get('/', controller.getAllRequests);
router.put('/:id/status', controller.updateRequestStatus);
router.post('/:id/notes', controller.addNote);
router.get('/:id/notes', controller.getRequestNotes);
router.put('/:id/link-patient', controller.linkPatientToRequest);

module.exports = router;
