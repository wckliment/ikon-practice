const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const pollForCheckInUpdates = require('../polling/checkInWatcher');

router.post('/checkins', authenticateUser, async (req, res) => {
  console.log('🧠 User in request:', req.user); // Add this

  const { location_id } = req.user;

  if (!location_id) {
    return res.status(400).json({ error: 'User has no associated location' });
  }

  try {
    await pollForCheckInUpdates(location_id);
    res.status(200).json({ message: `Polling complete for location ${location_id}` });
  } catch (error) {
    console.error('❌ Polling error:', error.message);
    res.status(500).json({ error: 'Polling failed' });
  }
});

module.exports = router;
