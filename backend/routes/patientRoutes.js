const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/authMiddleware'); // ✅ Bring in auth middleware
const { initializeOpenDental } = require('../middleware/appointmentMiddleware');
const { getPatientById } = require('../controllers/patientsController');

// ✅ First authenticate the user to populate req.user
router.use(authenticateUser);

// ✅ Then initialize OpenDentalService using req.user.location_id
router.use(initializeOpenDental);

// ✅ Finally handle the route
router.get('/:id', getPatientById);

module.exports = router;
