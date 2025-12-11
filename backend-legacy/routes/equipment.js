const express = require('express');
const router = express.Router();

// Equipment Agent routes - placeholder for now
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    agent_type: 'Equipment Agent',
    capabilities: [
      'Photo analysis',
      'Equipment identification',
      'Maintenance recommendations'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 