const express = require('express');
const router = express.Router();
const formTemplateController = require('../controllers/formTemplateController');

router.post('/', formTemplateController.createFormTemplate);
router.get('/', formTemplateController.getAllFormTemplates);
router.get('/:id', formTemplateController.getFormTemplateById);
router.delete('/:id', formTemplateController.deleteFormTemplate);
router.put('/:id', formTemplateController.updateFormTemplate);


module.exports = router;
