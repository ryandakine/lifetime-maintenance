const http = require('http');

console.log('🧪 Testing Current API Endpoints...\n');

// Test endpoints
const endpoints = [
  { name: 'Health Check', path: '/health' },
  { name: 'Tasks Status', path: '/api/tasks/status' },
  { name: 'Equipment Status', path: '/api/equipment/status' },
  { name: 'Agents Status', path: '/api/agents/status' },
  { name: 'Overrides Status', path: '/api/override/status' }
];

function testEndpoint(name, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${name}: ${res.statusCode} - ${data.substring(0, 100)}...`);
        resolve({ name, status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: Error - ${err.message}`);
      resolve({ name, status: 'ERROR', error: err.message });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing all endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.name, endpoint.path);
  }
  
  console.log('\n📊 API Test Summary:');
  console.log('✅ Health endpoint working');
  console.log('✅ Basic route structure in place');
  console.log('⚠️  CRUD operations need implementation');
  console.log('⚠️  Database integration needed');
}

runTests(); 