console.log('🧪 Testing Route Imports...');

try {
  console.log('1. Testing analytics route import...');
  const analyticsRoutes = require('./backend/routes/analytics');
  console.log('✅ Analytics routes imported successfully');
} catch (error) {
  console.error('❌ Analytics routes import error:', error.message);
}

try {
  console.log('2. Testing workflow route import...');
  const workflowRoutes = require('./backend/routes/workflow');
  console.log('✅ Workflow routes imported successfully');
} catch (error) {
  console.error('❌ Workflow routes import error:', error.message);
}

console.log('✅ Route import test completed'); 