const fs = require('fs');

// API keys provided by user
const API_KEYS = {
  PERPLEXITY: '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',
  CLAUDE: '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',
  OPENAI: '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'
};

function updateEnvFile() {
  console.log('🔑 Updating .env file with API keys...');
  
  try {
    // Read current .env file
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Perplexity API key
    envContent = envContent.replace(
      /VITE_PERPLEXITY_API_KEY=.*/,
      `VITE_PERPLEXITY_API_KEY=${API_KEYS.PERPLEXITY}`
    );
    
    // Update Claude API key
    envContent = envContent.replace(
      /VITE_ANTHROPIC_API_KEY=.*/,
      `VITE_ANTHROPIC_API_KEY=${API_KEYS.CLAUDE}`
    );
    
    // Add OpenAI API key if not present
    if (!envContent.includes('VITE_OPENAI_API_KEY')) {
      envContent += `\n# OpenAI API (backup)\nVITE_OPENAI_API_KEY=${API_KEYS.OPENAI}\n`;
    }
    
    // Write updated content back
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Successfully updated .env file with API keys!');
    console.log('📋 Updated keys:');
    console.log('   - Perplexity API ✅');
    console.log('   - Claude API ✅');
    console.log('   - OpenAI API ✅');
    
    // Show what still needs to be configured
    console.log('\n⚠️  Still need to configure:');
    console.log('   - VITE_SUPABASE_URL (for database/storage)');
    console.log('   - VITE_SUPABASE_ANON_KEY (for database/storage)');
    console.log('   - VITE_GROK_API_KEY (for enhanced AI analysis)');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Get Supabase keys from https://supabase.com');
    console.log('   2. Get Grok Pro key from https://x.ai');
    console.log('   3. Update the remaining keys in .env');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    console.log('\n📝 Manual update required. Please edit .env file and replace:');
    console.log(`VITE_PERPLEXITY_API_KEY=${API_KEYS.PERPLEXITY}`);
    console.log(`VITE_ANTHROPIC_API_KEY=${API_KEYS.CLAUDE}`);
  }
}

updateEnvFile(); 