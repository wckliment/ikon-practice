const express = require('express');
const router = express.Router();
const formsController = require('../controllers/formsController');

// Public-facing route for patients filling a form
router.get('/fill/:token', formsController.getFormByToken);

module.exports = router;
