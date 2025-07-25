// Test ACI.dev Integration
import aciIntegration from './src/lib/aciIntegration.js'

async function testACIIntegration() {
  console.log('🧪 Testing ACI.dev Integration...')
  
  try {
    // Test initialization
    console.log('1. Testing initialization...')
    const initResult = await aciIntegration.initialize()
    console.log('Init result:', initResult)
    
    // Test available tools
    console.log('2. Testing available tools...')
    const tools = aciIntegration.getAvailableTools()
    console.log('Available tools:', tools.map(t => t.name))
    
    // Test command processing
    console.log('3. Testing command processing...')
    const commands = [
      'Schedule a workout for tomorrow',
      'Send me a progress report',
      'Export my goals to Notion',
      'Send a message to Slack'
    ]
    
    for (const command of commands) {
      console.log(`\nTesting command: "${command}"`)
      const result = await aciIntegration.processCommand(command)
      console.log('Result:', result)
    }
    
    console.log('\n✅ All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testACIIntegration() 