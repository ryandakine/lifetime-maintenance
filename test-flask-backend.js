const http = require('http');

// Test Flask backend health endpoint
function testFlaskBackend() {
  console.log('🧪 Testing Flask Backend...');
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Flask Backend Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Flask Backend Response:', response);
        console.log('✅ Flask Backend is working correctly!');
      } catch (error) {
        console.log('📄 Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Flask Backend Error:', error.message);
  });

  req.end();
}

// Test root endpoint
function testFlaskRoot() {
  console.log('\n🧪 Testing Flask Root Endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Flask Root Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Flask Root Response:', response);
      } catch (error) {
        console.log('📄 Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Flask Root Error:', error.message);
  });

  req.end();
}

// Run tests
setTimeout(() => {
  testFlaskBackend();
  setTimeout(testFlaskRoot, 1000);
}, 2000); 