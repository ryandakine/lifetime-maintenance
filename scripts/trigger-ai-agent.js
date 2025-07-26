#!/usr/bin/env node

/**
 * Trigger AI Agent for Lifetime Maintenance PWA
 * Simple script to send requests to the n8n AI agent webhook
 */

const fetch = require('node-fetch');

class AIAgentTrigger {
  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/lifetime-ai-agent';
  }

  async triggerTask(taskDescription, context = 'general') {
    try {
      console.log(`🤖 Triggering AI Agent with task: ${taskDescription}`);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: taskDescription,
          context: context,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ AI Agent Response:');
      console.log('Action:', result.action);
      console.log('Reasoning:', result.reasoning);
      console.log('Confidence:', result.confidence);
      
      if (result.result) {
        console.log('Task Result:', result.result.success ? 'SUCCESS' : 'FAILED');
        console.log('Output:', result.result.output);
        if (result.result.error) {
          console.log('Error:', result.result.error);
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to trigger AI Agent:', error.message);
      throw error;
    }
  }

  async generateComponent(componentName, description) {
    return this.triggerTask(`Create a React component for ${componentName}: ${description}`, 'code_generation');
  }

  async runTests(testType = 'all') {
    return this.triggerTask(`Run ${testType} tests`, 'testing');
  }

  async deployApp() {
    return this.triggerTask('Build and deploy the app', 'deployment');
  }

  async optimizePerformance() {
    return this.triggerTask('Optimize app performance', 'optimization');
  }

  async debugIssue(issue) {
    return this.triggerTask(`Fix the issue: ${issue}`, 'debugging');
  }
}

// CLI Interface
if (require.main === module) {
  const trigger = new AIAgentTrigger();
  const command = process.argv[2];
  const task = process.argv[3];

  if (!command) {
    console.log(`
🤖 AI Agent Trigger for Lifetime Maintenance PWA

Usage:
  node trigger-ai-agent.js <command> [task]

Commands:
  task <description>     - Trigger a custom task
  component <name> <desc> - Generate a React component
  test [type]           - Run tests (default: all)
  deploy                - Build and deploy the app
  optimize              - Optimize performance
  debug <issue>         - Debug an issue

Examples:
  node trigger-ai-agent.js task "Add a new feature for task filtering"
  node trigger-ai-agent.js component TaskFilter "Component for filtering tasks by priority"
  node trigger-ai-agent.js test unit
  node trigger-ai-agent.js deploy
  node trigger-ai-agent.js optimize
  node trigger-ai-agent.js debug "Voice recognition not working"
`);
    process.exit(0);
  }

  async function runCommand() {
    try {
      switch (command) {
        case 'task':
          if (!task) {
            console.error('❌ Please provide a task description');
            process.exit(1);
          }
          await trigger.triggerTask(task);
          break;
          
        case 'component':
          const componentName = task;
          const description = process.argv[4];
          if (!componentName || !description) {
            console.error('❌ Please provide component name and description');
            process.exit(1);
          }
          await trigger.generateComponent(componentName, description);
          break;
          
        case 'test':
          await trigger.runTests(task || 'all');
          break;
          
        case 'deploy':
          await trigger.deployApp();
          break;
          
        case 'optimize':
          await trigger.optimizePerformance();
          break;
          
        case 'debug':
          if (!task) {
            console.error('❌ Please provide an issue description');
            process.exit(1);
          }
          await trigger.debugIssue(task);
          break;
          
        default:
          console.error(`❌ Unknown command: ${command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Command failed:', error.message);
      process.exit(1);
    }
  }

  runCommand();
}

module.exports = { AIAgentTrigger }; 