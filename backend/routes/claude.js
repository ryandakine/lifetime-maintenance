const express = require('express')
const router = express.Router()
const { Anthropic } = require('@anthropic-ai/sdk')

// Initialize Claude client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Voice command processing endpoint
router.post('/process-voice', async (req, res) => {
  try {
    const { command, context } = req.body
    
    if (!command) {
      return res.status(400).json({ error: 'Voice command is required' })
    }

    console.log('Processing voice command:', command)
    console.log('Context:', context)

    // Create a comprehensive prompt for Claude to understand the voice command
    const systemPrompt = `You are an AI assistant for a Lifetime Fitness Maintenance System. Your job is to understand voice commands and convert them into specific actions.

Available actions in the system:
- create_task: Create a new maintenance task
- add_shopping_item: Add item to shopping list
- navigate: Navigate to different sections (dashboard, tasks, photos, shopping, maintenance)
- take_photo: Trigger photo capture
- check_equipment: Check equipment status
- schedule_maintenance: Schedule maintenance for equipment
- report_issue: Report maintenance issues

Current context:
- Current tab: ${context?.currentTab || 'unknown'}
- Available actions: ${context?.availableActions?.join(', ') || 'all'}

Voice commands can be:
1. Direct commands: "create task fix treadmill"
2. Natural language: "I need to fix the broken treadmill"
3. Navigation: "go to the tasks page"
4. Shopping: "add oil filter to shopping list"

Respond with a JSON object containing:
{
  "action": "action_name",
  "params": "extracted parameters",
  "confidence": 0.95,
  "explanation": "brief explanation of what was understood"
}

If the command is unclear or doesn't match any action, return:
{
  "action": null,
  "params": null,
  "confidence": 0.0,
  "explanation": "Command not recognized"
}`

    const userPrompt = `Voice command: "${command}"

Please analyze this command and determine the appropriate action.`

    // Call Claude API
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    // Parse Claude's response
    const claudeResponse = response.content[0].text
    
    // Try to extract JSON from Claude's response
    let parsedResponse
    try {
      // Look for JSON in the response
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        // Fallback parsing
        parsedResponse = {
          action: null,
          params: null,
          confidence: 0.0,
          explanation: "Could not parse Claude's response"
        }
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError)
      parsedResponse = {
        action: null,
        params: null,
        confidence: 0.0,
        explanation: "Error parsing response"
      }
    }

    // Log the processing result
    console.log('Claude response:', claudeResponse)
    console.log('Parsed response:', parsedResponse)

    // Add processing metadata
    const result = {
      ...parsedResponse,
      originalCommand: command,
      processedAt: new Date().toISOString(),
      model: 'claude-3-5-sonnet-20241022'
    }

    res.json(result)

  } catch (error) {
    console.error('Error processing voice command:', error)
    res.status(500).json({
      error: 'Failed to process voice command',
      details: error.message,
      action: null,
      params: null,
      confidence: 0.0
    })
  }
})

// Voice command history endpoint
router.get('/voice-history', async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return empty array
    res.json([])
  } catch (error) {
    console.error('Error fetching voice history:', error)
    res.status(500).json({ error: 'Failed to fetch voice history' })
  }
})

// Voice command training endpoint (for improving recognition)
router.post('/train-voice', async (req, res) => {
  try {
    const { command, action, success } = req.body
    
    // This would typically save to a database for training
    console.log('Voice training data:', { command, action, success })
    
    res.json({ success: true, message: 'Training data recorded' })
  } catch (error) {
    console.error('Error recording training data:', error)
    res.status(500).json({ error: 'Failed to record training data' })
  }
})

module.exports = router 