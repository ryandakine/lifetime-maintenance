const http = require('http');

console.log('🧪 Testing Backend API...\n');

// Test the health endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Response: ${data.substring(0, 200)}...`);
    
    if (res.statusCode === 200) {
      console.log('\n🎉 Backend API is working!');
    } else {
      console.log('\n❌ Backend API is not responding correctly');
    }
  });
});

req.on('error', (err) => {
  console.log(`❌ Error: ${err.message}`);
  console.log('\n❌ Backend API is not running');
});

req.end(); 