const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');

router.post('/', notesController.createNote);
router.get('/:appointmentRequestId', notesController.getNotesByAppointmentRequest);

module.exports = router;
