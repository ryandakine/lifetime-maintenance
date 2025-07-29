const aiService = require('./backend/services/ai_analysis');

console.log('🔍 Debugging AI Analysis Service...\n');

async function debugAIAnalysis() {
  try {
    console.log('1. Testing basic service instantiation...');
    console.log('✅ AI Service loaded successfully');
    
    console.log('\n2. Testing mock analysis generation...');
    const mockResult = aiService.generateEnhancedMockAnalysis({
      equipmentType: 'Treadmill',
      taskDescription: 'Test analysis'
    });
    console.log('✅ Mock analysis generated:', mockResult ? 'Success' : 'Failed');
    
    console.log('\n3. Testing enhanced photo analysis...');
    const result = await aiService.analyzePhoto('mock-path', {
      equipmentType: 'Treadmill',
      taskDescription: 'Test analysis'
    });
    
    console.log('✅ Analysis result:', result ? 'Success' : 'Failed');
    if (result) {
      console.log('   Success:', result.success);
      console.log('   Model:', result.model);
      console.log('   Has Analysis:', !!result.analysis);
      if (result.analysis) {
        console.log('   Equipment:', result.analysis.equipment ? 'Present' : 'Missing');
        console.log('   Damages:', result.analysis.damages ? 'Present' : 'Missing');
        console.log('   Components:', result.analysis.components ? 'Present' : 'Missing');
        console.log('   Assessment:', result.analysis.assessment ? 'Present' : 'Missing');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAIAnalysis(); 