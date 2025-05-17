const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to :formId
const formSubmissionController = require('../controllers/formSubmissionController');

router.post("/", formSubmissionController.submitForm);
router.get("/:submissionId", formSubmissionController.getFormSubmissionById);
router.get("/:submissionId/pdf", formSubmissionController.downloadSubmissionPdf);


module.exports = router;
