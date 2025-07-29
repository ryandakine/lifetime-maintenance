const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './backend/.env' });

// Test server
const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Test Claude integration
const { ClaudeAPI } = require('./backend/config/claude');
const { PerplexityAPI } = require('./backend/config/perplexity');

const claude = new ClaudeAPI();
const perplexity = new PerplexityAPI();

// Test endpoint
app.post('/test/ai', async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('🤖 Testing AI Integration...');
    console.log('Message:', message);
    
    // Test Claude intent analysis
    const intent = await claude.analyzeIntent(message);
    console.log('Claude Intent:', intent);
    
    // Test Perplexity search
    const searchResult = await perplexity.search(message, 'maintenance');
    console.log('Perplexity Search:', searchResult.substring(0, 200) + '...');
    
    res.json({
      success: true,
      claude_intent: intent,
      perplexity_search: searchResult.substring(0, 200) + '...',
      message: 'AI integration test successful!'
    });
    
  } catch (error) {
    console.error('❌ AI Test Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    ai_integration: 'Claude + Perplexity',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI test: POST http://localhost:${PORT}/test/ai`);
  console.log('✅ Ready to test enhanced AI integration!');
}); 