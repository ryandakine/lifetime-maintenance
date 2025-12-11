const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const axios = require('axios');

// CEO Agent - Main coordinator for natural language processing and delegation
router.post('/ceo', [
  body('message').notEmpty().withMessage('Message is required'),
  body('context').optional(),
  body('user_id').optional()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, context = 'general', user_id = 'default' } = req.body;

    console.log(`🤖 CEO Agent received: "${message}"`);

    // Analyze intent using Perplexity Pro API
    const intent = await analyzeIntent(message);
    
    // Route to appropriate agent based on intent
    const response = await routeToAgent(intent, message, context, user_id);

    res.json({
      success: true,
      ceo_response: response.ceo_response,
      next_actions: response.next_actions,
      intent: intent,
      department: response.department,
      priority: response.priority,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ CEO Agent error:', error);
    res.status(500).json({
      success: false,
      error: 'CEO Agent processing failed',
      message: error.message
    });
  }
});

// Analyze user intent using Perplexity Pro API
async function analyzeIntent(message) {
  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: `You are an intent analyzer for a maintenance management system. Analyze the user's message and return a JSON object with:
          {
            "type": "equipment_maintenance|task_management|shopping|status_report|general_inquiry",
            "topic": "specific topic",
            "urgency": "critical|high|normal|low",
            "action": "specific action needed",
            "department": "maintenance|operations|development"
          }
          
          Focus on maintenance-related intents.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const intent = JSON.parse(content);
      return intent;
    } catch (parseError) {
      // Fallback to basic intent detection
      return fallbackIntentAnalysis(message);
    }

  } catch (error) {
    console.error('❌ Intent analysis failed:', error);
    return fallbackIntentAnalysis(message);
  }
}

// Fallback intent analysis
function fallbackIntentAnalysis(message) {
  const lowerMessage = message.toLowerCase();
  
  // Equipment-related intents
  if (lowerMessage.includes('treadmill') || lowerMessage.includes('equipment') || lowerMessage.includes('machine')) {
    return {
      type: 'equipment_maintenance',
      topic: 'equipment_issue',
      urgency: lowerMessage.includes('broken') || lowerMessage.includes('not working') ? 'high' : 'normal',
      action: 'analyze_equipment',
      department: 'maintenance'
    };
  }
  
  // Task-related intents
  if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('schedule')) {
    return {
      type: 'task_management',
      topic: 'task_creation',
      urgency: 'normal',
      action: 'create_task',
      department: 'operations'
    };
  }
  
  // Shopping/parts intents
  if (lowerMessage.includes('parts') || lowerMessage.includes('order') || lowerMessage.includes('buy')) {
    return {
      type: 'shopping',
      topic: 'parts_ordering',
      urgency: 'normal',
      action: 'order_parts',
      department: 'operations'
    };
  }
  
  // Default to general inquiry
  return {
    type: 'general_inquiry',
    topic: 'user_request',
    urgency: 'normal',
    action: 'process_request',
    department: 'operations'
  };
}

// Route to appropriate agent
async function routeToAgent(intent, originalMessage, context, user_id) {
  let ceo_response = '';
  let next_actions = [];
  let department = intent.department;

  switch (intent.type) {
    case 'equipment_maintenance':
      ceo_response = `I understand there's an equipment issue. Let me coordinate with our Equipment Agent to analyze the situation and our Repair Agent to prepare a solution.`;
      next_actions = ['Delegating to Equipment Agent for analysis'];
      break;
      
    case 'task_management':
      ceo_response = `I'll help you manage that task. Let me coordinate with our Task Agent to create and track this for you.`;
      next_actions = ['Delegating to Task Agent for task creation'];
      break;
      
    case 'shopping':
      ceo_response = `I'll help you with parts ordering. Let me coordinate with our Shopping Agent to find the right parts and create an order.`;
      next_actions = ['Delegating to Shopping Agent for parts ordering'];
      break;
      
    case 'status_report':
      ceo_response = `I'll get you a status report. Let me gather information from all our agents to give you a comprehensive overview.`;
      next_actions = ['Gathering status from all agents'];
      break;
      
    default:
      ceo_response = `I understand your request. Let me coordinate with the appropriate department to help you.`;
      next_actions = ['Processing general request'];
  }

  return {
    ceo_response,
    next_actions,
    department,
    priority: intent.urgency
  };
}

// Get CEO Agent status
router.get('/ceo/status', (req, res) => {
  res.json({
    status: 'active',
    agent_type: 'CEO Agent',
    capabilities: [
      'Natural language processing',
      'Intent analysis',
      'Task delegation',
      'Department routing'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 