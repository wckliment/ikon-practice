const express = require('express');
const router = express.Router();
const formsController = require('../controllers/formsController');
const authenticateUser = require('../middleware/authMiddleware');

// Apply authentication middleware
router.use(authenticateUser);

// Fetch completed forms for a patient
router.get('/patient/:patNum', formsController.getFormsForPatient);

// Fetch fields/answers for a completed form
router.get('/sheet/:sheetNum/fields', formsController.getFieldsForForm);

// Send a form
router.post('/send', formsController.sendForm);

// Cancel a form
router.patch('/:formId/cancel', formsController.cancelForm);

// Get sheet definitions
router.get('/sheetdefs', formsController.getSheetDefs);


module.exports = router;
