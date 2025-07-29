const http = require('http');

// Test all services
async function testCompleteSystem() {
  console.log('🧪 Testing Complete System...\n');
  
  // Test Flask Backend
  console.log('1️⃣ Testing Flask Backend...');
  await testEndpoint('localhost', 8000, '/health', 'Flask Backend');
  
  // Test Node.js API
  console.log('\n2️⃣ Testing Node.js API...');
  await testEndpoint('localhost', 3002, '/health', 'Node.js API');
  
  // Test Flask Backend Root
  console.log('\n3️⃣ Testing Flask Backend Root...');
  await testEndpoint('localhost', 8000, '/', 'Flask Backend Root');
  
  // Test Node.js API Tasks
  console.log('\n4️⃣ Testing Node.js API Tasks...');
  await testEndpoint('localhost', 3002, '/api/tasks', 'Node.js API Tasks');
  
  console.log('\n✅ System Test Complete!');
}

function testEndpoint(hostname, port, path, serviceName) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port,
      path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`   ✅ ${serviceName} Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`   📊 ${serviceName} Response:`, JSON.stringify(response, null, 2));
        } catch (error) {
          console.log(`   📄 ${serviceName} Raw Response:`, data.substring(0, 200) + '...');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ ${serviceName} Error:`, error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.error(`   ⏰ ${serviceName} Timeout`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Run the test
testCompleteSystem(); 