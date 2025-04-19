const express = require('express');
const router = express.Router();
const hiddenMessagesController = require('../controllers/hiddenMessagesController');
const authenticate = require('../middleware/authMiddleware');

// ✅ Single message hide
router.post('/hide', authenticate, hiddenMessagesController.hideMessage);

// ✅ Bulk message hide
router.post('/', authenticate, hiddenMessagesController.hideMessagesForUser);

// ✅ Fetch hidden message IDs for current user
router.get('/hidden', authenticate, hiddenMessagesController.getHiddenMessageIds);

module.exports = router;
