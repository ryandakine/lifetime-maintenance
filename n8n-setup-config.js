// n8n Setup Configuration for Lifetime Fitness Maintenance
// This file helps you configure your webhook URLs and test workflows

const n8nConfig = {
  // Replace these with your actual n8n webhook URLs once you import the workflows
  webhookUrls: {
    emailAutomation: 'https://your-n8n-instance.com/webhook/email-automation',
    aiAssistant: 'https://your-n8n-instance.com/webhook/ai-assistant',
    taskProcessing: 'https://your-n8n-instance.com/webhook/task-processing',
    photoAnalysis: 'https://your-n8n-instance.com/webhook/photo-analysis',
    shoppingProcessing: 'https://your-n8n-instance.com/webhook/shopping-processing'
  },
  
  // Environment variables you need to set in n8n
  environmentVariables: {
    PERPLEXITY_API_KEY: 'your-perplexity-api-key-here',
    GMAIL_CREDENTIALS: 'your-gmail-credentials'
  },
  
  // Test data for each workflow
  testData: {
    email: {
      topic: 'Equipment maintenance update',
      recipient: 'team@lifetimefitness.com',
      urgency: 'normal'
    },
    ai: {
      message: 'What maintenance tasks are due today?',
      context: 'fitness-facility-maintenance'
    },
    task: {
      description: 'Check treadmill maintenance schedule',
      priority: 'high',
      equipment: 'treadmill'
    },
    photo: {
      description: 'Equipment damage assessment',
      category: 'equipment-maintenance'
    },
    shopping: {
      item: 'treadmill belt',
      quantity: 1,
      urgency: 'medium'
    }
  }
};

// Function to test a workflow
const testWorkflow = async (workflowName, webhookUrl, testData) => {
  try {
    console.log(`🧪 Testing ${workflowName}...`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${workflowName} - SUCCESS!`);
      console.log('Response:', result);
    } else {
      console.log(`❌ ${workflowName} - FAILED!`);
      console.log('Error:', result);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ${workflowName} - ERROR!`);
    console.log('Error:', error.message);
    return null;
  }
};

// Function to test all workflows
const testAllWorkflows = async () => {
  console.log('🚀 Testing All Lifetime Fitness Maintenance Workflows\n');
  
  const tests = [
    { name: 'Email Automation', url: n8nConfig.webhookUrls.emailAutomation, data: n8nConfig.testData.email },
    { name: 'AI Assistant', url: n8nConfig.webhookUrls.aiAssistant, data: n8nConfig.testData.ai },
    { name: 'Task Processing', url: n8nConfig.webhookUrls.taskProcessing, data: n8nConfig.testData.task },
    { name: 'Photo Analysis', url: n8nConfig.webhookUrls.photoAnalysis, data: n8nConfig.testData.photo },
    { name: 'Shopping Processing', url: n8nConfig.webhookUrls.shoppingProcessing, data: n8nConfig.testData.shopping }
  ];
  
  for (const test of tests) {
    await testWorkflow(test.name, test.url, test.data);
    console.log(''); // Empty line for readability
  }
  
  console.log('🎉 All workflow tests completed!');
};

// Function to update React app with webhook URLs
const updateReactApp = () => {
  console.log('📝 To update your React app with these webhook URLs:');
  console.log('1. Open src/components/Dashboard.jsx');
  console.log('2. Replace the fetch URLs with your actual webhook URLs');
  console.log('3. Save the file');
  console.log('4. Your app will automatically reload and use the new URLs');
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { n8nConfig, testWorkflow, testAllWorkflows, updateReactApp };
}

// If running directly, show setup instructions
if (typeof window === 'undefined') {
  console.log('🔧 n8n Setup Instructions:');
  console.log('1. Import workflows/lifetime-fitness-maintenance-workflows.json into n8n');
  console.log('2. Set environment variables in n8n');
  console.log('3. Activate all workflows');
  console.log('4. Copy webhook URLs and update this config file');
  console.log('5. Run testAllWorkflows() to test everything');
  console.log('');
  console.log('📋 Current webhook URLs (update these):');
  Object.entries(n8nConfig.webhookUrls).forEach(([key, url]) => {
    console.log(`   ${key}: ${url}`);
  });
} 