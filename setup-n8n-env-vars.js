// Setup script for n8n environment variables
// This script helps you configure the environment variables needed for your Lifetime Fitness Maintenance workflows

const envVars = {
  // Perplexity API Key (for AI assistant functionality)
  PERPLEXITY_API_KEY: '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',
  
  // Gmail credentials (for email automation)
  GMAIL_CREDENTIALS: {
    type: 'service_account',
    project_id: 'your-gmail-project-id',
    private_key_id: 'your-private-key-id',
    private_key: 'your-private-key',
    client_email: 'your-service-account-email',
    client_id: 'your-client-id',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'your-cert-url'
  },
  
  // Alternative: Use the API keys from your MLB betting system
  THE_ODDS_API_KEY: 'aa49772bf36d88bf4962faa14015d882',
  ANTHROPIC_API_KEY: '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',
  OPENAI_API_KEY: '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',
  GROK_API_KEY: 'xai-token-BuzMo8nIroBT7e0LhVshTdjIYFP7wrk1znc9Bg9sD8My3HMtA8ONHiqNCjYMW6vPGoBv67LELKTYyl0p'
};

console.log('🔧 n8n Environment Variables Setup Guide');
console.log('==========================================\n');

console.log('📋 **Required Environment Variables for Lifetime Fitness Maintenance:**\n');

console.log('1️⃣ **PERPLEXITY_API_KEY**');
console.log('   - Purpose: AI assistant functionality');
console.log('   - Status: ✅ READY TO USE');
console.log('   - Value: ' + envVars.PERPLEXITY_API_KEY.substring(0, 20) + '...\n');

console.log('2️⃣ **GMAIL_CREDENTIALS**');
console.log('   - Purpose: Email automation');
console.log('   - Setup required: Google Cloud Console OAuth2');
console.log('   - Current value: ' + (envVars.GMAIL_CREDENTIALS.project_id === 'your-gmail-project-id' ? '❌ NOT SET' : '✅ SET') + '\n');

console.log('📝 **How to Set These in n8n Cloud:**\n');

console.log('1. **Open your n8n cloud instance**');
console.log('2. **Go to Settings** → **Environment Variables**');
console.log('3. **Click "Add Variable"** for each one\n');

console.log('🔑 **Available API Keys from MLB Betting System:**\n');

console.log('✅ THE_ODDS_API_KEY: ' + envVars.THE_ODDS_API_KEY);
console.log('✅ ANTHROPIC_API_KEY: ' + envVars.ANTHROPIC_API_KEY.substring(0, 20) + '...');
console.log('✅ OPENAI_API_KEY: ' + envVars.OPENAI_API_KEY.substring(0, 20) + '...');
console.log('✅ GROK_API_KEY: ' + envVars.GROK_API_KEY.substring(0, 20) + '...\n');

console.log('🚀 **Quick Setup Commands:**\n');

console.log('For Perplexity API (RECOMMENDED):');
console.log('1. Use the PERPLEXITY_API_KEY from above');
console.log('2. Add to n8n as: PERPLEXITY_API_KEY');
console.log('3. Import the updated workflow file\n');

console.log('For Gmail (Alternative):');
console.log('1. Use the OPENAI_API_KEY from above');
console.log('2. Add to n8n as: OPENAI_API_KEY');
console.log('3. Update workflow to use OpenAI instead of Perplexity\n');

console.log('📊 **Test Your Setup:**\n');

console.log('After setting up, test with:');
console.log('curl -X POST "your-webhook-url" \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"topic": "Test email", "recipient": "test@example.com"}\'');

module.exports = envVars; 