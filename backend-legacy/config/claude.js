const Anthropic = require('@anthropic-ai/sdk');

// Claude API configuration
const CLAUDE_CONFIG = {
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  temperature: 0.3,
  systemPrompt: `You are an AI agent for Lifetime Fitness Maintenance. 
  You have access to equipment data, maintenance history, and can analyze photos.
  Always provide actionable, specific recommendations.
  
  Your capabilities include:
  - Natural language understanding and processing
  - Equipment analysis and recommendations
  - Task planning and management
  - Maintenance scheduling and prioritization
  - Safety assessment and risk evaluation
  - Parts identification and ordering assistance
  
  Always be professional, helpful, and provide specific, actionable advice.`
};

// Initialize Claude client
const claude = new Anthropic({
  apiKey: CLAUDE_CONFIG.apiKey,
});

// Claude API wrapper class
class ClaudeAPI {
  constructor() {
    this.client = claude;
    this.config = CLAUDE_CONFIG;
  }

  // Analyze user intent
  async analyzeIntent(message) {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 1000,
        temperature: this.config.temperature,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this maintenance request and return a JSON object with:
            {
              "type": "equipment_maintenance|task_management|shopping|status_report|general_inquiry",
              "topic": "specific topic",
              "urgency": "critical|high|normal|low",
              "action": "specific action needed",
              "department": "maintenance|operations|development",
              "confidence": 0.0-1.0
            }
            
            Request: "${message}"`
          }
        ]
      });

      const content = response.content[0].text;
      
      // Try to parse JSON response
      try {
        const intent = JSON.parse(content);
        return intent;
      } catch (parseError) {
        console.error('Failed to parse Claude intent response:', parseError);
        return this.fallbackIntentAnalysis(message);
      }

    } catch (error) {
      console.error('Claude intent analysis failed:', error);
      return this.fallbackIntentAnalysis(message);
    }
  }

  // Generate equipment recommendations
  async generateRecommendations(context) {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 2000,
        temperature: this.config.temperature,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate detailed maintenance recommendations based on this context:
            
            Equipment Info: ${JSON.stringify(context.equipmentInfo)}
            Analysis: ${JSON.stringify(context.visionAnalysis)}
            History: ${JSON.stringify(context.maintenanceHistory)}
            
            Provide recommendations in this JSON format:
            {
              "immediate_actions": ["action1", "action2"],
              "safety_concerns": ["concern1", "concern2"],
              "required_parts": [{"part": "name", "estimated_cost": "amount"}],
              "estimated_time": "hours",
              "skill_level": "beginner|intermediate|expert",
              "priority": "critical|high|normal|low",
              "detailed_plan": "step-by-step instructions"
            }`
          }
        ]
      });

      const content = response.content[0].text;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return {
          immediate_actions: ['Manual inspection required'],
          safety_concerns: ['Please assess safety manually'],
          required_parts: [],
          estimated_time: '2-4 hours',
          skill_level: 'intermediate',
          priority: 'normal',
          detailed_plan: 'Schedule technician visit for detailed assessment'
        };
      }

    } catch (error) {
      console.error('Claude recommendations failed:', error);
      return {
        immediate_actions: ['System error - manual assessment required'],
        safety_concerns: ['Please assess safety manually'],
        required_parts: [],
        estimated_time: 'TBD',
        skill_level: 'intermediate',
        priority: 'normal',
        detailed_plan: 'Contact system administrator'
      };
    }
  }

  // Analyze task requirements
  async analyzeTask(description) {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 1500,
        temperature: this.config.temperature,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this maintenance task and return a JSON object:
            
            Task: "${description}"
            
            Return:
            {
              "complexity": "simple|moderate|complex",
              "estimated_hours": "number",
              "required_tools": ["tool1", "tool2"],
              "required_skills": ["skill1", "skill2"],
              "safety_requirements": ["requirement1", "requirement2"],
              "dependencies": ["dependency1", "dependency2"]
            }`
          }
        ]
      });

      const content = response.content[0].text;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return {
          complexity: 'moderate',
          estimated_hours: 2,
          required_tools: ['Basic tools'],
          required_skills: ['General maintenance'],
          safety_requirements: ['Follow safety protocols'],
          dependencies: ['Equipment access']
        };
      }

    } catch (error) {
      console.error('Claude task analysis failed:', error);
      return {
        complexity: 'moderate',
        estimated_hours: 2,
        required_tools: ['Basic tools'],
        required_skills: ['General maintenance'],
        safety_requirements: ['Follow safety protocols'],
        dependencies: ['Equipment access']
      };
    }
  }

  // Generate task plan
  async generateTaskPlan(context) {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 2000,
        temperature: this.config.temperature,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate a detailed task plan for this maintenance request:
            
            Description: ${context.description}
            Priority: ${context.priority}
            Equipment ID: ${context.equipmentId}
            Available Resources: ${JSON.stringify(context.availableResources)}
            Similar Tasks: ${JSON.stringify(context.similarTasks)}
            
            Return a comprehensive task plan in JSON format:
            {
              "title": "Task title",
              "description": "Detailed description",
              "steps": [{"step": 1, "action": "description", "time": "minutes"}],
              "estimatedTime": "total hours",
              "requiredParts": [{"part": "name", "quantity": "number"}],
              "skillLevel": "beginner|intermediate|expert",
              "safetyNotes": ["note1", "note2"],
              "qualityChecks": ["check1", "check2"]
            }`
          }
        ]
      });

      const content = response.content[0].text;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return {
          title: 'Maintenance Task',
          description: context.description,
          steps: [{ step: 1, action: 'Assess situation', time: 30 }],
          estimatedTime: 2,
          requiredParts: [],
          skillLevel: 'intermediate',
          safetyNotes: ['Follow safety protocols'],
          qualityChecks: ['Verify completion']
        };
      }

    } catch (error) {
      console.error('Claude task plan generation failed:', error);
      return {
        title: 'Maintenance Task',
        description: context.description,
        steps: [{ step: 1, action: 'Manual assessment required', time: 60 }],
        estimatedTime: 2,
        requiredParts: [],
        skillLevel: 'intermediate',
        safetyNotes: ['Follow safety protocols'],
        qualityChecks: ['Verify completion']
      };
    }
  }

  // Fallback intent analysis
  fallbackIntentAnalysis(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('treadmill') || lowerMessage.includes('equipment') || lowerMessage.includes('machine')) {
      return {
        type: 'equipment_maintenance',
        topic: 'equipment_issue',
        urgency: lowerMessage.includes('broken') || lowerMessage.includes('not working') ? 'high' : 'normal',
        action: 'analyze_equipment',
        department: 'maintenance',
        confidence: 0.8
      };
    }
    
    if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('schedule')) {
      return {
        type: 'task_management',
        topic: 'task_creation',
        urgency: 'normal',
        action: 'create_task',
        department: 'operations',
        confidence: 0.7
      };
    }
    
    return {
      type: 'general_inquiry',
      topic: 'user_request',
      urgency: 'normal',
      action: 'process_request',
      department: 'operations',
      confidence: 0.5
    };
  }
}

module.exports = {
  CLAUDE_CONFIG,
  ClaudeAPI
}; 