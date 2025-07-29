console.log('🧪 Testing Workflow Service Import...');

try {
  console.log('1. Testing workflow service import...');
  const workflowService = require('./backend/services/workflow-automation');
  console.log('✅ Workflow service imported successfully');
  
  console.log('2. Testing workflow rules access...');
  console.log('Rules:', Object.keys(workflowService.rules));
  console.log('✅ Workflow rules accessible');
  
  console.log('3. Testing workflow service methods...');
  console.log('Methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(workflowService)));
  console.log('✅ Workflow service methods accessible');
  
} catch (error) {
  console.error('❌ Error importing workflow service:', error.message);
  console.error('Stack trace:', error.stack);
} 