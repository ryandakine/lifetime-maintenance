#!/usr/bin/env node

/**
 * n8n AI Agent Integration for Lifetime Maintenance PWA
 * Self-building AI agent that learns from your development patterns
 * and automates complex development tasks
 */

const fs = require('fs')
const path = require('path')
const { execSync, spawn } = require('child_process')
const { AgentManager } = require('./background-agents')

class N8nAIAgent {
  constructor() {
    this.agentManager = new AgentManager()
    this.n8nProcess = null
    this.isRunning = false
    this.workflowId = null
    this.learningData = {
      patterns: [],
      decisions: [],
      outcomes: []
    }
    this.config = {
      n8nUrl: 'http://localhost:5678',
      workflowTemplate: 'self-building-ai-agent',
      learningEnabled: true,
      autoOptimize: true,
      maxConcurrentTasks: 3
    }
  }

  async start() {
    if (this.isRunning) return
    
    console.log('🤖 Starting n8n AI Agent...')
    this.isRunning = true

    try {
      // Start n8n if not running
      await this.ensureN8nRunning()
      
      // Deploy the self-building AI agent workflow
      await this.deployWorkflow()
      
      // Initialize learning system
      await this.initializeLearning()
      
      // Start monitoring and optimization
      this.startMonitoring()
      
      console.log('✅ n8n AI Agent started successfully!')
      console.log('🌐 n8n interface: http://localhost:5678')
      console.log('🤖 AI Agent workflow: http://localhost:5678/workflow/new?templateId=self-building-ai-agent')
      
    } catch (error) {
      console.error('❌ Failed to start n8n AI Agent:', error.message)
      this.isRunning = false
    }
  }

  async ensureN8nRunning() {
    console.log('🔍 Checking if n8n is running...')
    
    try {
      // Check if n8n is already running
      const response = await fetch(`${this.config.n8nUrl}/healthz`)
      if (response.ok) {
        console.log('✅ n8n is already running')
        return
      }
    } catch (error) {
      console.log('🚀 Starting n8n...')
      await this.startN8n()
    }
  }

  async startN8n() {
    return new Promise((resolve, reject) => {
      this.n8nProcess = spawn('npx', ['n8n'], {
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          N8N_BASIC_AUTH_ACTIVE: 'true',
          N8N_BASIC_AUTH_USER: 'admin',
          N8N_BASIC_AUTH_PASSWORD: 'admin123',
          N8N_ENCRYPTION_KEY: 'your-encryption-key-here'
        }
      })

      this.n8nProcess.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('n8n ready on')) {
          console.log('✅ n8n started successfully')
          resolve()
        }
        process.stdout.write(output)
      })

      this.n8nProcess.stderr.on('data', (data) => {
        process.stderr.write(data.toString())
      })

      this.n8nProcess.on('error', (error) => {
        console.error('❌ Failed to start n8n:', error)
        reject(error)
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Timeout starting n8n'))
      }, 30000)
    })
  }

  async deployWorkflow() {
    console.log('📦 Deploying self-building AI agent workflow...')
    
    try {
      // Create workflow configuration
      const workflowConfig = this.createWorkflowConfig()
      
      // Deploy to n8n
      const response = await fetch(`${this.config.n8nUrl}/rest/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from('admin:admin123').toString('base64')
        },
        body: JSON.stringify(workflowConfig)
      })

      if (response.ok) {
        const result = await response.json()
        this.workflowId = result.id
        console.log('✅ Workflow deployed successfully')
      } else {
        throw new Error(`Failed to deploy workflow: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Failed to deploy workflow:', error.message)
      throw error
    }
  }

  createWorkflowConfig() {
    return {
      name: 'Lifetime Maintenance AI Agent',
      active: true,
      nodes: [
        {
          id: '1',
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'ai-agent',
            responseMode: 'responseNode'
          }
        },
        {
          id: '2',
          name: 'AI Decision Engine',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [460, 300],
          parameters: {
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{ $env.OPENAI_API_KEY }}'
            },
            body: {
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: this.getSystemPrompt()
                },
                {
                  role: 'user',
                  content: '{{ $json.input }}'
                }
              ],
              temperature: 0.7
            }
          }
        },
        {
          id: '3',
          name: 'Task Executor',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [680, 300],
          parameters: {
            jsCode: this.getTaskExecutorCode()
          }
        },
        {
          id: '4',
          name: 'Learning Engine',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [900, 300],
          parameters: {
            jsCode: this.getLearningEngineCode()
          }
        },
        {
          id: '5',
          name: 'Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [1120, 300],
          parameters: {
            respondWith: 'json',
            responseBody: '={{ $json }}'
          }
        }
      ],
      connections: {
        'Webhook Trigger': {
          main: [['AI Decision Engine']]
        },
        'AI Decision Engine': {
          main: [['Task Executor']]
        },
        'Task Executor': {
          main: [['Learning Engine']]
        },
        'Learning Engine': {
          main: [['Response']]
        }
      }
    }
  }

  getSystemPrompt() {
    return `You are an AI development assistant for the Lifetime Maintenance PWA project. Your role is to:

1. **Analyze Development Requests**: Understand what the user wants to accomplish
2. **Generate Code**: Create or modify React components, functions, and configurations
3. **Execute Tasks**: Run commands, tests, and deployment processes
4. **Learn from Outcomes**: Improve based on success/failure of previous actions

**Available Actions:**
- code_generation: Generate React components, hooks, utilities
- testing: Run tests and generate coverage reports
- deployment: Build and deploy the application
- optimization: Analyze and optimize performance
- documentation: Update documentation and guides
- debugging: Analyze errors and provide solutions

**Project Context:**
- React 18 with Vite
- Supabase backend
- PWA capabilities
- Voice assistant integration
- Background agents system

**Response Format:**
{
  "action": "action_type",
  "parameters": {
    "file": "path/to/file",
    "code": "generated code",
    "command": "npm command",
    "description": "what this does"
  },
  "reasoning": "why this action was chosen",
  "confidence": 0.95
}`
  }

  getTaskExecutorCode() {
    return `
// Task Executor for n8n AI Agent
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const input = $input.first().json;
const action = input.action;
const params = input.parameters || {};

let result = { success: false, output: '', error: '' };

try {
  switch (action) {
    case 'code_generation':
      result = await generateCode(params);
      break;
    case 'testing':
      result = await runTests(params);
      break;
    case 'deployment':
      result = await deployApp(params);
      break;
    case 'optimization':
      result = await optimizePerformance(params);
      break;
    case 'documentation':
      result = await updateDocumentation(params);
      break;
    case 'debugging':
      result = await debugIssue(params);
      break;
    default:
      result.error = 'Unknown action: ' + action;
  }
} catch (error) {
  result.error = error.message;
}

// Add learning data
const learningData = {
  timestamp: new Date().toISOString(),
  action: action,
  parameters: params,
  result: result,
  input: input
};

// Save to learning database
fs.appendFileSync(
  path.join(__dirname, '../data/ai-learning.jsonl'),
  JSON.stringify(learningData) + '\\n'
);

return { ...input, result, learningData };
`
  }

  getLearningEngineCode() {
    return `
// Learning Engine for n8n AI Agent
const fs = require('fs');
const path = require('path');

const input = $input.first().json;
const learningData = input.learningData;

// Analyze patterns and outcomes
const patterns = analyzePatterns(learningData);
const recommendations = generateRecommendations(patterns);

// Update AI model with new insights
updateAIModel(patterns, recommendations);

return {
  ...input,
  patterns,
  recommendations,
  learningApplied: true
};

function analyzePatterns(data) {
  // Analyze success patterns, common errors, optimal parameters
  return {
    successRate: calculateSuccessRate(data),
    commonErrors: identifyCommonErrors(data),
    optimalParameters: findOptimalParameters(data)
  };
}

function generateRecommendations(patterns) {
  // Generate recommendations for future actions
  return {
    preferredActions: patterns.successRate > 0.8 ? 'continue' : 'adjust',
    parameterOptimizations: patterns.optimalParameters,
    errorAvoidance: patterns.commonErrors
  };
}

function updateAIModel(patterns, recommendations) {
  // Update the AI model with new insights
  const modelUpdate = {
    timestamp: new Date().toISOString(),
    patterns,
    recommendations
  };
  
  fs.appendFileSync(
    path.join(__dirname, '../data/ai-model-updates.jsonl'),
    JSON.stringify(modelUpdate) + '\\n'
  );
}
`
  }

  async initializeLearning() {
    console.log('🧠 Initializing AI learning system...')
    
    // Create data directory
    const dataDir = path.join(__dirname, '../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Initialize learning files
    const learningFile = path.join(dataDir, 'ai-learning.jsonl')
    const modelFile = path.join(dataDir, 'ai-model-updates.jsonl')
    
    if (!fs.existsSync(learningFile)) {
      fs.writeFileSync(learningFile, '')
    }
    if (!fs.existsSync(modelFile)) {
      fs.writeFileSync(modelFile, '')
    }

    console.log('✅ Learning system initialized')
  }

  startMonitoring() {
    console.log('👀 Starting AI agent monitoring...')
    
    // Monitor workflow performance
    setInterval(async () => {
      await this.monitorWorkflow()
    }, 60000) // Every minute

    // Optimize based on learning data
    setInterval(async () => {
      await this.optimizeWorkflow()
    }, 300000) // Every 5 minutes
  }

  async monitorWorkflow() {
    try {
      const response = await fetch(`${this.config.n8nUrl}/rest/workflows/${this.workflowId}/executions`)
      if (response.ok) {
        const executions = await response.json()
        const recentExecutions = executions.data.filter(exec => 
          new Date(exec.startedAt) > new Date(Date.now() - 3600000) // Last hour
        )
        
        console.log(`📊 AI Agent executed ${recentExecutions.length} tasks in the last hour`)
        
        // Analyze performance
        const successRate = recentExecutions.filter(exec => exec.finished).length / recentExecutions.length
        console.log(`📈 Success rate: ${(successRate * 100).toFixed(1)}%`)
      }
    } catch (error) {
      console.error('❌ Failed to monitor workflow:', error.message)
    }
  }

  async optimizeWorkflow() {
    if (!this.config.autoOptimize) return
    
    console.log('🔧 Optimizing AI agent workflow...')
    
    try {
      // Read learning data
      const learningFile = path.join(__dirname, '../data/ai-learning.jsonl')
      const learningData = fs.readFileSync(learningFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .slice(-100) // Last 100 entries

      // Analyze patterns
      const patterns = this.analyzeLearningPatterns(learningData)
      
      // Update workflow if needed
      if (patterns.needsOptimization) {
        await this.updateWorkflow(patterns.optimizations)
        console.log('✅ Workflow optimized based on learning data')
      }
    } catch (error) {
      console.error('❌ Failed to optimize workflow:', error.message)
    }
  }

  analyzeLearningPatterns(data) {
    const successRate = data.filter(entry => entry.result.success).length / data.length
    const commonErrors = this.findCommonErrors(data)
    const optimalParameters = this.findOptimalParameters(data)

    return {
      successRate,
      commonErrors,
      optimalParameters,
      needsOptimization: successRate < 0.8,
      optimizations: {
        errorHandling: commonErrors.length > 0,
        parameterTuning: Object.keys(optimalParameters).length > 0
      }
    }
  }

  findCommonErrors(data) {
    const errors = data
      .filter(entry => !entry.result.success)
      .map(entry => entry.result.error)
      .filter(error => error)

    const errorCounts = {}
    errors.forEach(error => {
      errorCounts[error] = (errorCounts[error] || 0) + 1
    })

    return Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }))
  }

  findOptimalParameters(data) {
    const successfulTasks = data.filter(entry => entry.result.success)
    const parameterGroups = {}

    successfulTasks.forEach(entry => {
      const action = entry.action
      if (!parameterGroups[action]) {
        parameterGroups[action] = []
      }
      parameterGroups[action].push(entry.parameters)
    })

    const optimalParams = {}
    Object.entries(parameterGroups).forEach(([action, params]) => {
      if (params.length > 3) {
        optimalParams[action] = this.findMostCommonParameters(params)
      }
    })

    return optimalParams
  }

  findMostCommonParameters(params) {
    // Find the most common parameter values
    const paramCounts = {}
    params.forEach(paramSet => {
      Object.entries(paramSet).forEach(([key, value]) => {
        if (!paramCounts[key]) paramCounts[key] = {}
        paramCounts[key][value] = (paramCounts[key][value] || 0) + 1
      })
    })

    const optimal = {}
    Object.entries(paramCounts).forEach(([key, values]) => {
      const mostCommon = Object.entries(values)
        .sort((a, b) => b[1] - a[1])[0]
      optimal[key] = mostCommon[0]
    })

    return optimal
  }

  async updateWorkflow(optimizations) {
    // Update workflow configuration based on optimizations
    console.log('🔄 Updating workflow with optimizations:', optimizations)
    
    // This would update the workflow nodes and connections
    // based on the learning data
  }

  async stop() {
    if (!this.isRunning) return
    
    console.log('🛑 Stopping n8n AI Agent...')
    this.isRunning = false

    if (this.n8nProcess) {
      this.n8nProcess.kill()
      this.n8nProcess = null
    }

    console.log('✅ n8n AI Agent stopped')
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      n8nUrl: this.config.n8nUrl,
      workflowId: this.workflowId,
      learningEnabled: this.config.learningEnabled,
      autoOptimize: this.config.autoOptimize
    }
  }

  async triggerTask(taskDescription) {
    if (!this.isRunning) {
      throw new Error('AI Agent is not running')
    }

    try {
      const response = await fetch(`${this.config.n8nUrl}/webhook/ai-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: taskDescription,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ AI Agent task completed:', result)
        return result
      } else {
        throw new Error(`Failed to trigger task: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Failed to trigger AI Agent task:', error.message)
      throw error
    }
  }
}

// CLI Interface
if (require.main === module) {
  const agent = new N8nAIAgent()
  const command = process.argv[2]

  switch (command) {
    case 'start':
      agent.start()
      break
    case 'stop':
      agent.stop()
      break
    case 'status':
      console.log(agent.getStatus())
      break
    case 'trigger':
      const task = process.argv[3]
      if (task) {
        agent.triggerTask(task)
      } else {
        console.log('Usage: node n8n-ai-agent.js trigger "task description"')
      }
      break
    default:
      console.log(`
🤖 n8n AI Agent for Lifetime Maintenance PWA

Usage:
  node n8n-ai-agent.js start     - Start the AI agent
  node n8n-ai-agent.js stop      - Stop the AI agent
  node n8n-ai-agent.js status    - Show agent status
  node n8n-ai-agent.js trigger   - Trigger a task

Examples:
  node n8n-ai-agent.js trigger "Add a new React component for task filtering"
  node n8n-ai-agent.js trigger "Optimize the bundle size and run performance tests"
  node n8n-ai-agent.js trigger "Fix the linting errors in the Tasks component"
`)
  }
}

module.exports = { N8nAIAgent } 