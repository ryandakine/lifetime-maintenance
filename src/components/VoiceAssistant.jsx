import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Mic, 
  MicOff, 
  Brain,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
  HelpCircle,
  Navigation,
  Command,
  Zap
} from 'lucide-react'

const VoiceAssistant = () => {
  console.log('Rendering VoiceAssistant')
  const navigate = useNavigate()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSupported, setIsSupported] = useState(false)
  const [clarification, setClarification] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [settings, setSettings] = useState({
    autoNavigate: true,
    confirmActions: true,
    voiceFeedback: true
  })

  const recognitionRef = useRef(null)

  // Check online status and browser support
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    const recognition = recognitionRef.current
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('Voice recognition started')
      setIsListening(true)
      setTranscript('')
      setClarification('')
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      console.log('Voice input:', transcript)
      setTranscript(transcript)
      processVoiceCommand(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        showMessage('warning', 'No speech detected. Please try again.')
      } else if (event.error === 'audio-capture') {
        showMessage('error', 'Microphone access denied. Please allow microphone access.')
      } else {
        showMessage('error', `Voice recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      console.log('Voice recognition ended')
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isSupported])

  const startListening = () => {
    if (!isOnline) {
      showMessage('error', 'Offline, can\'t listen')
      return
    }

    if (!isSupported) {
      showMessage('error', 'Voice recognition not supported in this browser')
      return
    }

    try {
      recognitionRef.current?.start()
    } catch (error) {
      console.error('Error starting voice recognition:', error)
      showMessage('error', 'Failed to start voice recognition')
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  const processVoiceCommand = async (command) => {
    if (!command.trim()) return

    try {
      setIsProcessing(true)
      const anthropicApiKey = API_KEYS.ANTHROPIC

      if (!anthropicApiKey || anthropicApiKey === 'your-anthropic-key') {
        console.warn('Anthropic API key not configured, using fallback parsing')
        // Fallback: simple keyword-based parsing
        const action = parseCommandFallback(command)
        executeAction(action)
        return
      }

      console.log('Processing voice command with Claude 4.0 Max...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Parse this voice command for a maintenance management app and determine the intended action.

Voice Command: "${command}"

Available Actions:
1. Navigation: "go to [page]" → navigate to /tasks, /shopping, /email, /photos, /maintenance
2. Task Management: "add task [description]" → create new task
3. Email: "send email [recipient] [subject]" → compose email
4. Shopping: "add to shopping [items]" → create shopping list
5. Knowledge: "search knowledge [query]" → search knowledge base
6. Files: "upload file" → go to file upload

If the command is unclear or ambiguous, ask a clarifying question.

Return as JSON:
{
  "action": "navigate|add_task|send_email|add_shopping|search_knowledge|upload_file|clarify",
  "target": "page_name|task_description|email_details|shopping_items|search_query|file_action",
  "confidence": "high|medium|low",
  "clarification": "question to ask if unclear",
  "navigation": "/tasks|/shopping|/email|/photos|/maintenance",
  "parameters": {
    "task": "task description",
    "email_recipient": "recipient",
    "email_subject": "subject",
    "shopping_items": "items list",
    "search_query": "search terms"
  }
}

Examples:
- "go to tasks" → {"action": "navigate", "target": "tasks", "confidence": "high", "navigation": "/tasks"}
- "add task fix HVAC" → {"action": "add_task", "target": "fix HVAC", "confidence": "high", "parameters": {"task": "fix HVAC"}}
- "send email to boss about concrete" → {"action": "send_email", "target": "email", "confidence": "high", "parameters": {"email_recipient": "boss", "email_subject": "concrete"}}
- "add to shopping light bulbs and cement" → {"action": "add_shopping", "target": "shopping", "confidence": "high", "parameters": {"shopping_items": "light bulbs and cement"}}
- "what did you say" → {"action": "clarify", "target": "unclear", "confidence": "low", "clarification": "I didn't catch that. Could you repeat your command?"}`
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude API error:', response.status, errorText)
        throw new Error(`Claude API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.content[0].text
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response')
      }

      const parsedCommand = JSON.parse(jsonMatch[0])
      console.log('Claude parsed command:', parsedCommand)

      // Add to command history
      setCommandHistory(prev => [...prev, {
        command,
        action: parsedCommand.action,
        timestamp: new Date().toISOString()
      }])

      if (parsedCommand.action === 'clarify') {
        setClarification(parsedCommand.clarification)
        showMessage('warning', parsedCommand.clarification)
      } else {
        executeAction(parsedCommand)
      }

    } catch (error) {
      console.error('Error processing voice command:', error)
      showMessage('error', 'Failed to process command. Using fallback parsing.')
      
      // Fallback: simple keyword-based parsing
      const action = parseCommandFallback(command)
      executeAction(action)
    } finally {
      setIsProcessing(false)
    }
  }

  const parseCommandFallback = (command) => {
    const lowerCommand = command.toLowerCase()
    
    // Navigation commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
      if (lowerCommand.includes('task')) return { action: 'navigate', target: 'tasks', navigation: '/tasks' }
      if (lowerCommand.includes('shop')) return { action: 'navigate', target: 'shopping', navigation: '/shopping' }
      if (lowerCommand.includes('email')) return { action: 'navigate', target: 'email', navigation: '/email' }
      if (lowerCommand.includes('photo')) return { action: 'navigate', target: 'photos', navigation: '/photos' }
      if (lowerCommand.includes('maintenance')) return { action: 'navigate', target: 'maintenance', navigation: '/maintenance' }
    }
    
    // Task commands
    if (lowerCommand.includes('add task') || lowerCommand.includes('create task')) {
      const taskDescription = command.replace(/add task|create task/i, '').trim()
      return { action: 'add_task', target: taskDescription, parameters: { task: taskDescription } }
    }
    
    // Email commands
    if (lowerCommand.includes('send email') || lowerCommand.includes('compose email')) {
      return { action: 'send_email', target: 'email', navigation: '/email' }
    }
    
    // Shopping commands
    if (lowerCommand.includes('add to shopping') || lowerCommand.includes('shopping list')) {
      const items = command.replace(/add to shopping|shopping list/i, '').trim()
      return { action: 'add_shopping', target: items, parameters: { shopping_items: items } }
    }
    
    // Default to clarification
    return { action: 'clarify', target: 'unclear', clarification: 'I didn\'t understand that command. Could you try again?' }
  }

  const executeAction = async (action) => {
    try {
      console.log('Executing action:', action)

      switch (action.action) {
        case 'navigate':
          if (action.navigation && settings.autoNavigate) {
            navigate(action.navigation)
            showMessage('success', `Navigating to ${action.target}`)
          }
          break

        case 'add_task':
          if (action.parameters?.task) {
            navigate('/tasks')
            // Store task for the Tasks component to pick up
            localStorage.setItem('voiceTask', action.parameters.task)
            showMessage('success', `Adding task: ${action.parameters.task}`)
          }
          break

        case 'send_email':
          navigate('/email')
          if (action.parameters?.email_recipient || action.parameters?.email_subject) {
            const emailData = {
              recipient: action.parameters.email_recipient || '',
              subject: action.parameters.email_subject || ''
            }
            localStorage.setItem('voiceEmail', JSON.stringify(emailData))
          }
          showMessage('success', 'Opening email composer')
          break

        case 'add_shopping':
          if (action.parameters?.shopping_items) {
            navigate('/shopping')
            localStorage.setItem('voiceShopping', action.parameters.shopping_items)
            showMessage('success', `Adding to shopping: ${action.parameters.shopping_items}`)
          }
          break

        case 'search_knowledge':
          navigate('/knowledge')
          // Trigger knowledge search
          localStorage.setItem('voiceKnowledge', action.parameters?.search_query || '')
          showMessage('success', `Searching knowledge: ${action.parameters?.search_query}`)
          break

        case 'upload_file':
          navigate('/maintenance')
          // Trigger file upload
          localStorage.setItem('voiceFileUpload', 'true')
          showMessage('success', 'Opening file upload')
          break

        case 'clarify':
          setClarification(action.clarification)
          showMessage('warning', action.clarification)
          break

        default:
          showMessage('error', 'Unknown action')
      }
    } catch (error) {
      console.error('Error executing action:', error)
      showMessage('error', 'Failed to execute action')
    }
  }

  const clearHistory = () => {
    setCommandHistory([])
    setTranscript('')
    setClarification('')
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  return (
    <div className="container">
      {!isOnline && (
        <div className="offline-alert">
          ⚠️ You are currently offline. Voice assistant may not work properly.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Voice Assistant Main Section */}
      <div className="card">
        <h3>Voice Assistant</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Use your voice to navigate and perform actions across the app.
        </p>

        {/* Voice Control Button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported || !isOnline || isProcessing}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isListening ? 'var(--danger-color)' : 'var(--primary-color)',
              color: 'white',
              fontSize: '2rem',
              cursor: isSupported && isOnline && !isProcessing ? 'pointer' : 'not-allowed',
              opacity: isSupported && isOnline && !isProcessing ? 1 : 0.6,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            {isProcessing ? (
              <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
            ) : isListening ? (
              <MicOff size={40} />
            ) : (
              <Mic size={40} />
            )}
          </button>
          
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
            {isListening ? 'Listening... Click to stop' : 'Click to start listening'}
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: isSupported ? 'var(--success-color)' : 'var(--danger-color)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.8rem'
          }}>
            {isSupported ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {isSupported ? 'Voice Supported' : 'Voice Not Supported'}
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: isOnline ? 'var(--success-color)' : 'var(--warning-color)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.8rem'
          }}>
            {isOnline ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Current Transcript */}
        {transcript && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
              <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
              You Said:
            </h4>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--light-color)', 
              borderRadius: '8px',
              fontStyle: 'italic',
              color: 'var(--text-color)'
            }}>
              "{transcript}"
            </div>
          </div>
        )}

        {/* Clarification */}
        {clarification && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--warning-color)' }}>
              <HelpCircle size={16} style={{ marginRight: '0.5rem' }} />
              Clarification Needed:
            </h4>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--light-color)', 
              borderRadius: '8px',
              color: 'var(--text-color)'
            }}>
              {clarification}
            </div>
          </div>
        )}

        {/* Command Examples */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <Command size={16} style={{ marginRight: '0.5rem' }} />
            Voice Commands
          </h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Navigation:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>"Go to tasks"</li>
                <li>"Navigate to shopping"</li>
                <li>"Open emails"</li>
                <li>"Show photos"</li>
              </ul>
            </div>
            <div>
              <strong>Actions:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>"Add task fix HVAC"</li>
                <li>"Send email to boss about concrete"</li>
                <li>"Add to shopping light bulbs and cement"</li>
                <li>"Search knowledge for pool maintenance"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary-color)' }}>
                <Navigation size={16} style={{ marginRight: '0.5rem' }} />
                Recent Commands
              </h4>
              <button
                onClick={clearHistory}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                <RotateCcw size={14} />
                Clear
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {commandHistory.slice(-5).reverse().map((cmd, index) => (
                <div key={index} style={{ 
                  padding: '0.5rem', 
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                    "{cmd.command}"
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                    {cmd.action} • {new Date(cmd.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VoiceAssistant 