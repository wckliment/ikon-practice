const express = require('express');
const router = express.Router();
const formTemplateController = require('../controllers/formTemplateController');

router.post('/', formTemplateController.createFormTemplate);
router.get('/', formTemplateController.getAllFormTemplates);
router.get('/:id', formTemplateController.getFormTemplateById);

module.exports = router;
