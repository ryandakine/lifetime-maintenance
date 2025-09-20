#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SmartAssistantSetup {
  constructor() {
    this.n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
    this.workflowFile = path.join(__dirname, '../workflows/smart-assistant-workflow.json');
    this.testDataDir = path.join(__dirname, '../test-data');
  }

  async start() {
    console.log('🤖 Smart Assistant Setup Starting...\n');
    
    try {
      await this.checkPrerequisites();
      await this.setupN8n();
      await this.deployWorkflow();
      await this.createTestData();
      await this.runTests();
      await this.showUsage();
      
      console.log('✅ Smart Assistant Setup Complete!\n');
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if n8n is installed
    try {
      execSync('n8n --version', { stdio: 'pipe' });
      console.log('✅ n8n is installed');
    } catch (error) {
      console.log('❌ n8n not found. Installing...');
      execSync('npm install -g n8n', { stdio: 'inherit' });
    }
    
    // Check if workflow file exists
    if (!fs.existsSync(this.workflowFile)) {
      throw new Error('Smart Assistant workflow file not found');
    }
    console.log('✅ Workflow file found');
    
    // Create test data directory
    if (!fs.existsSync(this.testDataDir)) {
      fs.mkdirSync(this.testDataDir, { recursive: true });
    }
    
    console.log('✅ Prerequisites check complete\n');
  }

  async setupN8n() {
    console.log('🚀 Setting up n8n...');
    
    // Start n8n in background if not running
    try {
      execSync(`curl -s ${this.n8nUrl}/healthz`, { stdio: 'pipe' });
      console.log('✅ n8n is already running');
    } catch (error) {
      console.log('Starting n8n...');
      execSync('n8n start', { stdio: 'inherit', detached: true });
      
      // Wait for n8n to start
      console.log('Waiting for n8n to start...');
      await this.waitForN8n();
    }
    
    console.log('✅ n8n setup complete\n');
  }

  async waitForN8n() {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        execSync(`curl -s ${this.n8nUrl}/healthz`, { stdio: 'pipe' });
        console.log('✅ n8n is ready');
        return;
      } catch (error) {
        attempts++;
        console.log(`Waiting for n8n... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('n8n failed to start within expected time');
  }

  async deployWorkflow() {
    console.log('📦 Deploying Smart Assistant workflow...');
    
    try {
      // Read workflow file
      const workflowData = JSON.parse(fs.readFileSync(this.workflowFile, 'utf8'));
      
      // Create workflow via n8n API
      const deployCommand = `curl -X POST ${this.n8nUrl}/rest/workflows \\
        -H "Content-Type: application/json" \\
        -d '${JSON.stringify(workflowData)}'`;
      
      const result = execSync(deployCommand, { encoding: 'utf8' });
      console.log('✅ Workflow deployed successfully');
      
      // Save workflow ID for later use
      const workflowId = JSON.parse(result).id;
      fs.writeFileSync(
        path.join(this.testDataDir, 'workflow-id.txt'),
        workflowId
      );
      
    } catch (error) {
      console.log('⚠️  Workflow deployment failed, but continuing...');
      console.log('You can manually import the workflow from the n8n interface');
    }
    
    console.log('✅ Workflow deployment complete\n');
  }

  async createTestData() {
    console.log('📝 Creating test data...');
    
    const testCases = [
      {
        name: 'photo-analysis',
        description: 'Test photo analysis with equipment image',
        data: {
          message: 'Analyze this photo of gym equipment',
          photo: {
            data: 'base64-encoded-image-data',
            filename: 'equipment-photo.jpg'
          },
          userId: 'test-user-1'
        }
      },
      {
        name: 'email-request',
        description: 'Test email composition',
        data: {
          message: 'Send email to maintenance@lifetimefitness.com about equipment inspection',
          userId: 'test-user-1'
        }
      },
      {
        name: 'task-creation',
        description: 'Test task creation',
        data: {
          message: 'Create a task for equipment maintenance due tomorrow',
          userId: 'test-user-1'
        }
      },
      {
        name: 'knowledge-query',
        description: 'Test knowledge base query',
        data: {
          message: 'How do I perform equipment maintenance?',
          userId: 'test-user-1'
        }
      },
      {
        name: 'urgent-request',
        description: 'Test urgent priority handling',
        data: {
          message: 'URGENT: Equipment malfunction needs immediate attention',
          userId: 'test-user-1'
        }
      }
    ];
    
    // Save test cases
    fs.writeFileSync(
      path.join(this.testDataDir, 'test-cases.json'),
      JSON.stringify(testCases, null, 2)
    );
    
    // Create test script
    const testScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function runTest(testCase) {
  console.log(\`🧪 Running test: \${testCase.name}\`);
  console.log(\`📝 Description: \${testCase.description}\`);
  
  try {
    const response = await fetch('http://localhost:5678/webhook/smart-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.data)
    });
    
    const result = await response.json();
    
    console.log('✅ Test completed successfully');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    console.log('---\\n');
    
    return { success: true, result };
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('---\\n');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  const testCases = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'test-cases.json'), 'utf8')
  );
  
  console.log('🚀 Starting Smart Assistant Tests\\n');
  
  const results = [];
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ ...testCase, ...result });
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(\`📊 Test Results: \${successCount}/\${results.length} tests passed\\n\`);
  
  return results;
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runTest, runAllTests };
`;
    
    fs.writeFileSync(
      path.join(this.testDataDir, 'run-tests.js'),
      testScript
    );
    
    console.log('✅ Test data created\n');
  }

  async runTests() {
    console.log('🧪 Running initial tests...');
    
    try {
      const testScript = path.join(this.testDataDir, 'run-tests.js');
      execSync(`node ${testScript}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Tests failed, but setup continues...');
    }
    
    console.log('✅ Initial tests complete\n');
  }

  async showUsage() {
    console.log('📚 Smart Assistant Usage Guide\n');
    
    console.log('🎯 How to use your Smart Assistant:');
    console.log('');
    console.log('1. 📸 Photo Analysis:');
    console.log('   Send a photo with message: "Analyze this equipment photo"');
    console.log('');
    console.log('2. 📧 Email Requests:');
    console.log('   Message: "Send email to team@company.com about maintenance"');
    console.log('');
    console.log('3. ✅ Task Creation:');
    console.log('   Message: "Create a task for equipment inspection due tomorrow"');
    console.log('');
    console.log('4. 📚 Knowledge Queries:');
    console.log('   Message: "How do I perform safety inspections?"');
    console.log('');
    console.log('5. 🚨 Urgent Requests:');
    console.log('   Message: "URGENT: Equipment malfunction needs attention"');
    console.log('');
    
    console.log('🔗 Webhook URL:');
    console.log(`   ${this.n8nUrl}/webhook/smart-assistant`);
    console.log('');
    
    console.log('🧪 Run tests:');
    console.log('   node test-data/run-tests.js');
    console.log('');
    
    console.log('📊 Monitor workflow:');
    console.log(`   ${this.n8nUrl}`);
    console.log('');
    
    console.log('📝 Example API calls:');
    console.log('');
    console.log('curl -X POST http://localhost:5678/webhook/smart-assistant \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"message": "Create a task for equipment maintenance"}\'');
    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const setup = new SmartAssistantSetup();
  setup.start().catch(console.error);
}

module.exports = SmartAssistantSetup;