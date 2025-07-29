# 🤖 Claude Subagents Integration Guide

## 🎯 Overview

Integrating **Claude Subagents from Claude Code** with our Lifetime Fitness Maintenance system to create a more powerful, intelligent agent-based architecture.

## 🏗️ Enhanced Architecture

```
                    🤖 CEO Agent (Claude Subagent)
                           |
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    📊 VP Operations    🔧 VP Maintenance   📈 VP Development
    (Claude Subagent)   (Claude Subagent)   (Claude Subagent)
        │                  │                  │
    ┌───┼───┐          ┌───┼───┐          ┌───┼───┐
    │   │   │          │   │   │          │   │   │
📋 Task  🛒 Shopping  🔍 Equipment  🛠️ Repair  🎯 Goals  📚 Learning
Agent    Agent        Agent        Agent      Agent      Agent
```

## 🔧 Integration Setup

### **1. Claude Code Configuration**
```javascript
// backend/config/claude.js
const CLAUDE_CONFIG = {
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  temperature: 0.3,
  systemPrompt: `You are an AI agent for Lifetime Fitness Maintenance. 
  You have access to equipment data, maintenance history, and can analyze photos.
  Always provide actionable, specific recommendations.`
};
```

### **2. Perplexity API Integration**
```javascript
// backend/config/perplexity.js
const PERPLEXITY_CONFIG = {
  apiKey: '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',
  model: 'llama-3.1-sonar-large-128k-online',
  visionModel: 'llama-3.1-sonar-large-128k-online',
  maxTokens: 2000,
  temperature: 0.2
};
```

## 🤖 Agent Implementations

### **CEO Agent (Claude Subagent)**
```javascript
// backend/agents/ceo-agent.js
class CEOAgent {
  constructor() {
    this.claude = new ClaudeAPI(CLAUDE_CONFIG);
    this.perplexity = new PerplexityAPI(PERPLEXITY_CONFIG);
    this.memory = new AgentMemory('ceo');
  }

  async processRequest(message, context) {
    // Use Claude for natural language understanding
    const intent = await this.claude.analyzeIntent(message);
    
    // Use Perplexity for real-time information
    const realTimeData = await this.perplexity.search(context);
    
    // Combine insights and delegate
    return this.delegateToSubagents(intent, realTimeData);
  }

  async delegateToSubagents(intent, realTimeData) {
    switch (intent.department) {
      case 'maintenance':
        return await this.maintenanceAgent.process(intent, realTimeData);
      case 'operations':
        return await this.operationsAgent.process(intent, realTimeData);
      case 'development':
        return await this.developmentAgent.process(intent, realTimeData);
    }
  }
}
```

### **Equipment Agent (Claude + Perplexity Vision)**
```javascript
// backend/agents/equipment-agent.js
class EquipmentAgent {
  constructor() {
    this.claude = new ClaudeAPI(CLAUDE_CONFIG);
    this.perplexity = new PerplexityAPI(PERPLEXITY_CONFIG);
    this.memory = new AgentMemory('equipment');
  }

  async analyzePhoto(photoData, equipmentInfo) {
    // Use Perplexity Vision for photo analysis
    const visionAnalysis = await this.perplexity.analyzeImage(photoData, {
      prompt: `Analyze this gym equipment photo. Identify:
      1. Equipment type and model
      2. Visible damage or wear
      3. Safety concerns
      4. Required maintenance actions
      5. Parts that may need replacement
      6. Estimated repair time and cost`
    });

    // Use Claude for detailed recommendations
    const recommendations = await this.claude.generateRecommendations({
      equipmentInfo,
      visionAnalysis,
      maintenanceHistory: await this.memory.getHistory(equipmentInfo.id)
    });

    return {
      analysis: visionAnalysis,
      recommendations: recommendations,
      confidence: this.calculateConfidence(visionAnalysis, recommendations)
    };
  }
}
```

### **Task Agent (Claude Subagent)**
```javascript
// backend/agents/task-agent.js
class TaskAgent {
  constructor() {
    this.claude = new ClaudeAPI(CLAUDE_CONFIG);
    this.memory = new AgentMemory('tasks');
  }

  async createTask(description, priority, equipmentId) {
    // Use Claude to understand task requirements
    const taskAnalysis = await this.claude.analyzeTask(description);
    
    // Generate detailed task plan
    const taskPlan = await this.claude.generateTaskPlan({
      description,
      priority,
      equipmentId,
      availableResources: await this.getAvailableResources(),
      similarTasks: await this.memory.getSimilarTasks(description)
    });

    return {
      task: taskPlan,
      estimatedTime: taskPlan.estimatedTime,
      requiredParts: taskPlan.requiredParts,
      skillLevel: taskPlan.skillLevel
    };
  }
}
```

## 🔄 Agent Communication

### **Inter-Agent Messaging**
```javascript
// backend/agents/agent-communication.js
class AgentCommunication {
  constructor() {
    this.claude = new ClaudeAPI(CLAUDE_CONFIG);
  }

  async coordinateAgents(request) {
    // Use Claude to coordinate between agents
    const coordination = await this.claude.coordinate({
      request,
      availableAgents: ['ceo', 'equipment', 'task', 'shopping', 'repair'],
      agentCapabilities: this.getAgentCapabilities()
    });

    return this.executeCoordination(coordination);
  }

  async executeCoordination(coordination) {
    const results = [];
    
    for (const action of coordination.actions) {
      const agent = this.getAgent(action.agent);
      const result = await agent.execute(action.task);
      results.push(result);
    }

    // Use Claude to synthesize final response
    return await this.claude.synthesizeResponse(results);
  }
}
```

## 📊 Enhanced Capabilities

### **Claude Subagents Benefits**
- **Natural Language Understanding**: Better context and nuance
- **Memory and Learning**: Persistent knowledge across interactions
- **Reasoning**: Complex problem-solving and decision-making
- **Code Generation**: Generate maintenance procedures and scripts
- **Multi-modal**: Handle text, images, and structured data

### **Perplexity Integration Benefits**
- **Real-time Information**: Latest equipment specs and parts
- **Vision Analysis**: Advanced photo analysis capabilities
- **Research**: Find solutions for unique problems
- **Cost Estimation**: Real-time parts pricing
- **Technical Documentation**: Access to repair manuals

## 🛠️ Implementation Steps

### **Step 1: Install Dependencies**
```bash
cd backend
npm install @anthropic-ai/sdk axios
```

### **Step 2: Configure Environment**
```bash
# backend/.env
CLAUDE_API_KEY=your_claude_api_key
PERPLEXITY_API_KEY=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
```

### **Step 3: Update Agent Routes**
```javascript
// backend/routes/agents.js
const CEOAgent = require('../agents/ceo-agent');
const EquipmentAgent = require('../agents/equipment-agent');
const TaskAgent = require('../agents/task-agent');

const ceoAgent = new CEOAgent();
const equipmentAgent = new EquipmentAgent();
const taskAgent = new TaskAgent();
```

### **Step 4: Test Integration**
```bash
# Test CEO Agent with Claude
curl -X POST http://localhost:3001/api/agents/ceo \
  -H "Content-Type: application/json" \
  -d '{
    "message": "The treadmill belt is slipping and making noise",
    "context": "equipment_maintenance"
  }'
```

## 🎯 Enhanced Features

### **Intelligent Photo Analysis**
- **Equipment Identification**: Automatic model and type detection
- **Damage Assessment**: AI-powered wear and tear analysis
- **Safety Evaluation**: Risk assessment and safety recommendations
- **Parts Identification**: Automatic parts recognition and ordering

### **Smart Task Management**
- **Automatic Prioritization**: AI-driven task scheduling
- **Resource Optimization**: Smart allocation of tools and personnel
- **Predictive Maintenance**: Identify issues before they become problems
- **Learning System**: Improve recommendations based on outcomes

### **Advanced Communication**
- **Natural Language**: Conversational interface with maintenance staff
- **Context Awareness**: Remember previous interactions and equipment history
- **Proactive Alerts**: Notify staff of potential issues
- **Knowledge Sharing**: Share solutions across the team

## 🚀 Next Steps

1. **Install Claude SDK** and configure API keys
2. **Implement agent classes** with Claude integration
3. **Test photo analysis** with Perplexity Vision
4. **Deploy enhanced agents** to production
5. **Train agents** on maintenance-specific data

---

**This integration will create a truly intelligent maintenance management system!** 🤖✨

The combination of Claude's reasoning and Perplexity's real-time capabilities will make your maintenance system incredibly powerful and user-friendly. 