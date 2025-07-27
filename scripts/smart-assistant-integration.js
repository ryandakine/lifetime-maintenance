#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SmartAssistantIntegration {
  constructor() {
    this.n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
    this.webhookUrl = `${this.n8nUrl}/webhook/smart-assistant`;
    this.testDataDir = path.join(__dirname, '../test-data');
  }

  async start() {
    console.log('🤖 Smart Assistant Integration Starting...\n');
    
    const command = process.argv[2];
    
    switch (command) {
      case 'test':
        await this.runTests();
        break;
      case 'send':
        await this.sendMessage();
        break;
      case 'photo':
        await this.analyzePhoto();
        break;
      case 'email':
        await this.sendEmail();
        break;
      case 'task':
        await this.createTask();
        break;
      case 'knowledge':
        await this.queryKnowledge();
        break;
      case 'interactive':
        await this.startInteractive();
        break;
      default:
        await this.showHelp();
    }
  }

  async runTests() {
    console.log('🧪 Running Smart Assistant Tests...\n');
    
    const testScript = path.join(this.testDataDir, 'run-tests.js');
    if (fs.existsSync(testScript)) {
      execSync(`node ${testScript}`, { stdio: 'inherit' });
    } else {
      console.log('❌ Test script not found. Run setup first.');
    }
  }

  async sendMessage() {
    const message = process.argv[3] || 'Hello, can you help me with maintenance?';
    
    console.log(`📤 Sending message: "${message}"\n`);
    
    try {
      const response = await this.callSmartAssistant({
        message,
        userId: 'integration-test'
      });
      
      console.log('✅ Response received:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  async analyzePhoto() {
    const photoPath = process.argv[3];
    
    if (!photoPath) {
      console.log('❌ Please provide a photo path: node scripts/smart-assistant-integration.js photo <photo-path>');
      return;
    }
    
    console.log(`📸 Analyzing photo: ${photoPath}\n`);
    
    try {
      // Read and encode photo
      const photoData = fs.readFileSync(photoPath);
      const base64Data = photoData.toString('base64');
      
      const response = await this.callSmartAssistant({
        message: 'Analyze this photo and tell me what you see',
        photo: {
          data: base64Data,
          filename: path.basename(photoPath)
        },
        userId: 'integration-test'
      });
      
      console.log('✅ Photo analysis complete:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  async sendEmail() {
    const recipient = process.argv[3] || 'maintenance@lifetimefitness.com';
    const subject = process.argv[4] || 'Maintenance Update';
    const message = process.argv[5] || 'Equipment inspection completed successfully.';
    
    console.log(`📧 Sending email to: ${recipient}\n`);
    
    try {
      const response = await this.callSmartAssistant({
        message: `Send email to ${recipient} about ${subject}: ${message}`,
        userId: 'integration-test'
      });
      
      console.log('✅ Email request processed:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  async createTask() {
    const title = process.argv[3] || 'Equipment Maintenance';
    const dueDate = process.argv[4] || 'tomorrow';
    
    console.log(`✅ Creating task: ${title} (due: ${dueDate})\n`);
    
    try {
      const response = await this.callSmartAssistant({
        message: `Create a task for ${title} due ${dueDate}`,
        userId: 'integration-test'
      });
      
      console.log('✅ Task creation processed:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  async queryKnowledge() {
    const query = process.argv[3] || 'How do I perform equipment maintenance?';
    
    console.log(`📚 Querying knowledge base: "${query}"\n`);
    
    try {
      const response = await this.callSmartAssistant({
        message: query,
        userId: 'integration-test'
      });
      
      console.log('✅ Knowledge query processed:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  async startInteractive() {
    console.log('💬 Interactive Smart Assistant Mode\n');
    console.log('Type your messages and press Enter. Type "quit" to exit.\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askQuestion = () => {
      rl.question('🤖 You: ', async (input) => {
        if (input.toLowerCase() === 'quit') {
          console.log('👋 Goodbye!');
          rl.close();
          return;
        }
        
        try {
          console.log('🔄 Processing...');
          const response = await this.callSmartAssistant({
            message: input,
            userId: 'interactive-user'
          });
          
          console.log('\n🤖 Assistant:');
          if (response.response) {
            console.log(response.response);
          } else {
            console.log(JSON.stringify(response, null, 2));
          }
          console.log('');
          
        } catch (error) {
          console.error('❌ Error:', error.message);
        }
        
        askQuestion();
      });
    };
    
    askQuestion();
  }

  async callSmartAssistant(data) {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async showHelp() {
    console.log('🤖 Smart Assistant Integration Tool\n');
    console.log('Usage: node scripts/smart-assistant-integration.js <command> [options]\n');
    console.log('Commands:');
    console.log('  test                    Run all tests');
    console.log('  send <message>          Send a text message');
    console.log('  photo <photo-path>      Analyze a photo');
    console.log('  email <recipient> [subject] [message]  Send email request');
    console.log('  task <title> [due-date] Create a task');
    console.log('  knowledge <query>       Query knowledge base');
    console.log('  interactive             Start interactive mode');
    console.log('  help                    Show this help\n');
    console.log('Examples:');
    console.log('  node scripts/smart-assistant-integration.js send "Hello, how can you help me?"');
    console.log('  node scripts/smart-assistant-integration.js photo ./equipment-photo.jpg');
    console.log('  node scripts/smart-assistant-integration.js email team@company.com "Maintenance Update"');
    console.log('  node scripts/smart-assistant-integration.js task "Equipment Inspection" tomorrow');
    console.log('  node scripts/smart-assistant-integration.js knowledge "How do I perform safety checks?"');
    console.log('  node scripts/smart-assistant-integration.js interactive');
    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const integration = new SmartAssistantIntegration();
  integration.start().catch(console.error);
}

module.exports = SmartAssistantIntegration;