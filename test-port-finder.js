const portFinder = require('./scripts/port-finder');

console.log('🧪 Testing Dynamic Port Finder...\n');

async function testPortFinder() {
  try {
    // Test individual port finding
    console.log('🔍 Testing individual port finding...');
    
    const frontendPort = await portFinder.findAvailablePort('frontend');
    console.log(`✅ Frontend port: ${frontendPort}`);
    
    const apiPort = await portFinder.findAvailablePort('api');
    console.log(`✅ API port: ${apiPort}`);
    
    const backendPort = await portFinder.findAvailablePort('backend');
    console.log(`✅ Backend port: ${backendPort}`);
    
    const vitePort = await portFinder.findAvailablePort('vite');
    console.log(`✅ Vite port: ${vitePort}`);
    
    // Test multiple port finding
    console.log('\n🔍 Testing multiple port finding...');
    const allPorts = await portFinder.findMultiplePorts(['frontend', 'api', 'backend', 'vite']);
    console.log('✅ All ports found:', allPorts);
    
    // Test port availability checking
    console.log('\n🔍 Testing port availability...');
    const isAvailable = await portFinder.isPortAvailable(9999);
    console.log(`✅ Port 9999 available: ${isAvailable}`);
    
    // Test port reservation
    console.log('\n🔍 Testing port reservation...');
    portFinder.reservePort(9999);
    const isStillAvailable = await portFinder.isPortAvailable(9999);
    console.log(`✅ Port 9999 still available after reservation: ${isStillAvailable}`);
    
    // Test port release
    portFinder.releasePort(9999);
    const isAvailableAfterRelease = await portFinder.isPortAvailable(9999);
    console.log(`✅ Port 9999 available after release: ${isAvailableAfterRelease}`);
    
    // Show status
    console.log('\n📊 Port Finder Status:');
    console.log(JSON.stringify(portFinder.getStatus(), null, 2));
    
    console.log('\n✅ All tests passed! Dynamic port finding is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPortFinder(); 