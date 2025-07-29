# 🤖 Agent-Based System Setup Guide

## 🎯 What You're Building

A **business hierarchy of AI agents** that work together like a real company:

```
                    🤖 CEO Agent (Main Coordinator)
                           |
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    📊 VP Operations    🔧 VP Maintenance   📈 VP Development
        │                  │                  │
    ┌───┼───┐          ┌───┼───┐          ┌───┼───┐
    │   │   │          │   │   │          │   │   │
📋 Task  🛒 Shopping  🔍 Equipment  🛠️ Repair  🎯 Goals  📚 Learning
Agent    Agent        Agent        Agent      Agent      Agent
```

## 🚀 Phase 1: CEO Agent Setup

### Step 1: Import CEO Agent
1. Go to your n8n cloud instance
2. Click **"Import from file"**
3. Select: `workflows/ceo-agent.json`
4. **Activate the workflow**
5. **Copy the webhook URL** from "CEO Agent Webhook" node

### Step 2: Import Equipment Agent
1. Click **"Import from file"** again
2. Select: `workflows/equipment-agent.json`
3. **Activate the workflow**
4. **Copy the webhook URL** from "Equipment Agent Webhook" node

### Step 3: Set Environment Variables
In n8n cloud, add these environment variables:
```
PERPLEXITY_API_KEY=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
CEO_AGENT_WEBHOOK=https://your-n8n-instance.com/webhook/ceo-agent
EQUIPMENT_AGENT_WEBHOOK=https://your-n8n-instance.com/webhook/equipment-agent
```

## 🎮 Testing Your Agent System

### Test 1: CEO Agent Natural Language
```bash
curl -X POST "YOUR_CEO_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "The treadmill in Cardio Room A is making a weird noise",
    "context": "equipment_issue",
    "user_id": "maintenance_team"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "ceo_response": "I understand there's an issue with the treadmill in Cardio Room A. Let me coordinate with our Equipment Agent to analyze the situation and our Repair Agent to prepare a solution.",
  "next_actions": ["Delegating to Equipment Agent for analysis"],
  "department": "maintenance",
  "priority": "normal"
}
```

### Test 2: Equipment Agent Photo Analysis
```bash
curl -X POST "YOUR_EQUIPMENT_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Treadmill belt slipping",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "location": "Cardio Room A",
    "issue": "Belt slipping during use",
    "priority": "high"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "equipment_analysis": {
    "equipment_type": "treadmill",
    "damage_assessment": "Belt showing signs of wear",
    "safety_concerns": "None identified",
    "required_actions": "Replace treadmill belt",
    "parts_needed": "Treadmill belt replacement kit",
    "tools_needed": "Allen wrench set, belt tension tool",
    "time_estimate": "1-2 hours",
    "cost_estimate": "$150-200",
    "priority": "high"
  }
}
```

## 🧠 Agent Memory & Learning

### Memory Structure
Each agent maintains its own memory:
```json
{
  "conversation_history": [...],
  "task_history": [...],
  "decisions_made": [...],
  "learning_data": {
    "successful_patterns": [...],
    "failed_attempts": [...],
    "user_preferences": {...}
  }
}
```

### Learning Capabilities
- **Pattern Recognition**: Learns what works vs what doesn't
- **User Preferences**: Remembers how you like things done
- **Efficiency Optimization**: Gets faster and better over time
- **Context Awareness**: Understands your current situation

## 🎯 Agent Capabilities

### 🤖 CEO Agent
- **Natural Language Processing**: Understands complex requests
- **Task Delegation**: Routes requests to appropriate agents
- **Decision Making**: Weighs options and makes recommendations
- **Memory Management**: Maintains system-wide context

### 🔍 Equipment Agent
- **Computer Vision**: Analyzes equipment photos
- **Parts Database**: Knows equipment specifications
- **Diagnostic Logic**: Identifies common problems
- **Grainger Integration**: Finds replacement parts

## 🚀 Phase 2: Department Agents (Coming Soon)

### 📊 VP Operations Agent
- **Task Agent**: Creates, tracks, prioritizes maintenance tasks
- **Shopping Agent**: Manages parts inventory and ordering

### 🔧 VP Maintenance Agent
- **Repair Agent**: Creates repair plans, estimates costs and time
- **Preventive Agent**: Schedules preventive maintenance

### 📈 VP Development Agent
- **Goals Agent**: Tracks personal goals and progress
- **Learning Agent**: Manages knowledge base and training

## 🎮 User Experience Examples

### Natural Conversations
```
User: "Hey, what's the status of the gym equipment?"
CEO Agent: "Let me check with our Equipment Agent... 
           I see 3 treadmills need maintenance, 1 elliptical has a minor issue, 
           and the weight room is all clear. Should I schedule the repairs?"

User: "Yes, but prioritize the treadmills since cardio is busy"
CEO Agent: "I'll have our Task Agent prioritize the treadmill repairs 
           and our Repair Agent prepare the parts list. 
           Estimated completion: 2 days."
```

### Proactive Management
```
Equipment Agent: "CEO, I've detected unusual wear patterns on Treadmill #3. 
                 Recommend preventive maintenance before it fails."

CEO Agent: "Good catch! I'll schedule maintenance for next week 
           and notify the team. This should prevent a costly breakdown."
```

## 🔧 Integration with React App

### Update Environment Variables
Create `.env` file with:
```
REACT_APP_CEO_AGENT_WEBHOOK=https://your-n8n-instance.com/webhook/ceo-agent
REACT_APP_EQUIPMENT_AGENT_WEBHOOK=https://your-n8n-instance.com/webhook/equipment-agent
```

### Voice Interface
The Voice tab will now route requests through the CEO Agent:
```javascript
// In VoiceInput.jsx
const processVoiceCommand = async () => {
  const response = await fetch(process.env.REACT_APP_CEO_AGENT_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: transcript,
      context: 'voice_command',
      user_id: 'user'
    })
  });
  const result = await response.json();
  // Display CEO response
};
```

## 🎯 Benefits of Agent Architecture

### For You
- **Natural Interaction**: Talk to it like a real person
- **Proactive Management**: Agents anticipate needs
- **Learning System**: Gets better over time
- **Comprehensive Coverage**: Handles all aspects of maintenance

### For Your Business
- **Efficiency**: Automated decision making
- **Consistency**: Standardized procedures
- **Scalability**: Easy to add new agents
- **Reliability**: Multiple agents ensure coverage

## 🚨 Troubleshooting

### Agent Not Responding
- Check if workflow is **activated**
- Verify **webhook URL** is correct
- Check **n8n logs** for errors
- Ensure **environment variables** are set

### Memory Issues
- Check **n8n variables** storage
- Verify **agent memory** is being updated
- Review **conversation history** in logs

### AI Analysis Problems
- Verify **PERPLEXITY_API_KEY** is set
- Check **API quota** limits
- Review **request format**

## 🎉 Success Metrics

Once set up, you'll have:
- **Natural language** interaction with your maintenance system
- **AI-powered** equipment analysis
- **Proactive** maintenance recommendations
- **Learning** system that improves over time
- **Professional** business-like coordination

## 📞 Next Steps

1. **Import CEO and Equipment agents** into n8n
2. **Test basic functionality** with curl commands
3. **Configure webhook URLs** in React app
4. **Start using natural language** interface
5. **Add more department agents** as needed

---

**Your agent-based maintenance system is ready to transform how you manage your fitness facility!** 🤖✨

The agents will learn, adapt, and become more efficient over time, just like a real team of employees. 