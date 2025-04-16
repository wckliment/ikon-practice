const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware'); // ✅ Bring in auth middleware
const { initializeOpenDental } = require('../middleware/appointmentMiddleware');
const { getPatientById, searchPatients } = require('../controllers/patientsController'); // ✅ Correct import
const { getPatientsByIds } = require('../controllers/patientsController');

// ✅ First authenticate the user to populate req.user
router.use(authenticateUser);

// ✅ Then initialize OpenDentalService using req.user.location_id
router.use(initializeOpenDental);

// ✅ Handle the route for searching patients
router.get('/', searchPatients); // ✅ Search patients by query parameter

// ✅ Handle the route for fetching a single patient by ID
router.get('/:id', getPatientById);

// ✅ Handle the route for batch fetching patients by PatNums
router.post('/batch', getPatientsByIds);


module.exports = router;
