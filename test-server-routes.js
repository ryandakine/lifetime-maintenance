const express = require('express');
const app = express();

// Import routes
const agentRoutes = require('./backend/routes/agents');
const equipmentRoutes = require('./backend/routes/equipment');
const taskRoutes = require('./backend/routes/tasks');
const overrideRoutes = require('./backend/routes/overrides');
const photoRoutes = require('./backend/routes/photos');
const analyticsRoutes = require('./backend/routes/analytics');
const workflowRoutes = require('./backend/routes/workflow');

console.log('🧪 Testing Server Routes...');

// Register routes
app.use('/api/agents', agentRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/override', overrideRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/workflow', workflowRoutes);

// List all registered routes
console.log('\n📋 Registered Routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`Router: ${middleware.regexp}`);
  }
});

console.log('\n✅ Route registration test completed'); 