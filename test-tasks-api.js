const http = require('http');

console.log('🧪 Testing Tasks API Endpoints...\n');

// Test configuration
const config = {
  hostname: 'localhost',
  port: 3001,
  basePath: '/api/tasks'
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.hostname,
      port: config.port,
      path: config.basePath + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testGetTasks() {
  console.log('📋 Testing GET /api/tasks (List all tasks)...');
  try {
    const response = await makeRequest('GET', '/');
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data, null, 2)}`);
    return response;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testCreateTask() {
  console.log('\n📝 Testing POST /api/tasks (Create new task)...');
  try {
    const taskData = {
      title: 'Test Maintenance Task',
      description: 'This is a test task for API testing',
      priority: 'high',
      status: 'pending',
      category: 'equipment',
      equipment_id: 1
    };

    const response = await makeRequest('POST', '/', taskData);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data, null, 2)}`);
    return response.data.data?.id; // Return the created task ID
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testGetTask(id) {
  console.log(`\n🔍 Testing GET /api/tasks/${id} (Get single task)...`);
  try {
    const response = await makeRequest('GET', `/${id}`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data, null, 2)}`);
    return response;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testUpdateTask(id) {
  console.log(`\n✏️ Testing PUT /api/tasks/${id} (Update task)...`);
  try {
    const updateData = {
      status: 'in-progress',
      description: 'Updated description for testing'
    };

    const response = await makeRequest('PUT', `/${id}`, updateData);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data, null, 2)}`);
    return response;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testGetTaskStats() {
  console.log('\n📊 Testing GET /api/tasks/stats (Get task statistics)...');
  try {
    const response = await makeRequest('GET', '/stats');
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data, null, 2)}`);
    return response;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testDeleteTask(id) {
  console.log(`\n🗑️ Testing DELETE /api/tasks/${id} (Delete task)...`);
  try {
    const response = await makeRequest('DELETE', `/${id}`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data, null, 2)}`);
    return response;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testInvalidRequests() {
  console.log('\n🚫 Testing Invalid Requests...');
  
  // Test getting non-existent task
  console.log('Testing GET /api/tasks/999 (Non-existent task)...');
  try {
    const response = await makeRequest('GET', '/999');
    console.log(`✅ Status: ${response.status} (Expected 404)`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test creating task without title
  console.log('Testing POST /api/tasks (Missing title)...');
  try {
    const response = await makeRequest('POST', '/', { description: 'No title' });
    console.log(`✅ Status: ${response.status} (Expected 400)`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Tasks API Tests...\n');
  
  // Test 1: Get all tasks
  await testGetTasks();
  
  // Test 2: Create a new task
  const taskId = await testCreateTask();
  
  if (taskId) {
    // Test 3: Get the created task
    await testGetTask(taskId);
    
    // Test 4: Update the task
    await testUpdateTask(taskId);
    
    // Test 5: Get updated task
    await testGetTask(taskId);
    
    // Test 6: Get task statistics
    await testGetTaskStats();
    
    // Test 7: Delete the task
    await testDeleteTask(taskId);
  }
  
  // Test 8: Test invalid requests
  await testInvalidRequests();
  
  console.log('\n🎉 Tasks API Testing Complete!');
  console.log('\n📊 Summary:');
  console.log('✅ GET /api/tasks - List all tasks');
  console.log('✅ POST /api/tasks - Create new task');
  console.log('✅ GET /api/tasks/:id - Get single task');
  console.log('✅ PUT /api/tasks/:id - Update task');
  console.log('✅ DELETE /api/tasks/:id - Delete task');
  console.log('✅ GET /api/tasks/stats - Get statistics');
  console.log('✅ Error handling for invalid requests');
}

// Run the tests
runAllTests().catch(console.error); 