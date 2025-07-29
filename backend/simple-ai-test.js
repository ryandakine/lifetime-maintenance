const { ClaudeAPI } = require('./config/claude');
const { PerplexityAPI } = require('./config/perplexity');

async function testAI() {
  console.log('🤖 Testing Enhanced AI Integration...\n');
  
  try {
    const claude = new ClaudeAPI();
    const perplexity = new PerplexityAPI();
    
    const testMessage = "The treadmill belt is slipping and making noise";
    
    console.log('📝 Test Message:', testMessage);
    console.log('🔍 Testing Claude Intent Analysis...');
    
    // Test Claude
    const intent = await claude.analyzeIntent(testMessage);
    console.log('✅ Claude Intent Result:', JSON.stringify(intent, null, 2));
    
    console.log('\n🔍 Testing Perplexity Search...');
    
    // Test Perplexity
    const searchResult = await perplexity.search(testMessage, 'maintenance');
    console.log('✅ Perplexity Search Result (first 200 chars):', searchResult.substring(0, 200) + '...');
    
    console.log('\n🎉 Enhanced AI Integration Test Successful!');
    console.log('\n📊 Summary:');
    console.log('- Claude: Intent analysis working');
    console.log('- Perplexity: Real-time search working');
    console.log('- Both APIs responding correctly');
    
  } catch (error) {
    console.error('❌ AI Test Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAI(); 