const express = require('express');
const router = express.Router();
const formsController = require('../controllers/formsController');

// Public-facing route for patients filling a form
router.get('/fill/:token', formsController.getFormByToken);

// Submit a form
router.post('/submit/:token', formsController.submitForm);

// Generate a form token
router.post('/generate-token', formsController.generateFormToken);

module.exports = router;
