const express = require('express');
const router = express.Router();

// Manual override routes - placeholder for now
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    agent_type: 'Manual Override System',
    capabilities: [
      'Manual task creation',
      'Manual equipment updates',
      'System overrides'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 