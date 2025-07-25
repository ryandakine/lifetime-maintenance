import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader, Send, HelpCircle, Paperclip, Image, File, Link, Zap, Clock, AlertCircle } from 'lucide-react'

// Simple fallback API keys
const API_KEYS = {
  ANTHROPIC: 'your-anthropic-key'
}

const CONTEXTS = [
  { key: 'general', label: 'General' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'email', label: 'Email' },
  { key: 'files', label: 'Files' },
  { key: 'profile', label: 'Profile' },
]

// 🚀 QUICK WIN #1: Voice Shortcuts
const VOICE_SHORTCUTS = {
  'task': 'add_task',
  'shop': 'add_shopping',
  'mail': 'send_email',
  'find': 'search_knowledge',
  'pic': 'upload_file',
  'now': 'urgent_tasks',
  'today': 'due_today',
  'status': 'show_status',
  'quick': 'quick_task',
  'urgent': 'urgent_tasks',
  'due': 'due_tasks',
  'help': 'show_help',
  'clear': 'clear_chat',
  'save': 'save_notes'
}

// 🚀 QUICK WIN #2: Smart Templates
const SMART_TEMPLATES = {
  'pool maintenance': {
    tasks: ['Check chlorine levels', 'Clean filter', 'Inspect equipment', 'Test water quality'],
    shopping: ['Chlorine tablets', 'Filter cleaner', 'Test strips'],
    notes: 'Standard pool maintenance checklist'
  },
  'hvac service': {
    tasks: ['Change filter', 'Check thermostat', 'Inspect ducts', 'Clean condenser'],
    shopping: ['Air filter', 'Thermostat battery', 'Duct tape'],
    notes: 'HVAC maintenance routine'
  },
  'monthly inspection': {
    tasks: ['Walk through facility', 'Check all systems', 'Document issues', 'Update maintenance log'],
    shopping: ['Inspection checklist', 'Camera for photos'],
    notes: 'Monthly facility inspection'
  },
  'emergency repair': {
    tasks: ['Assess damage', 'Contact contractor', 'Document incident', 'File insurance claim'],
    shopping: ['Emergency supplies', 'Contact information'],
    notes: 'Emergency repair protocol'
  },
  'weekly cleaning': {
    tasks: ['Clean common areas', 'Empty trash', 'Check restrooms', 'Restock supplies'],
    shopping: ['Cleaning supplies', 'Paper products'],
    notes: 'Weekly cleaning schedule'
  }
}

// 🚀 QUICK WIN #3: Batch Operations Helper
function parseBatchCommand(command) {
  const batchPatterns = [
    /add multiple tasks?: (.+)/i,
    /add shopping list: (.+)/i,
    /schedule emails?: (.+)/i,
    /create template: (.+)/i
  ]
  
  for (const pattern of batchPatterns) {
    const match = command.match(pattern)
    if (match) {
      const items = match[1].split(',').map(item => item.trim())
      return { type: pattern.source.includes('tasks') ? 'batch_tasks' : 
                       pattern.source.includes('shopping') ? 'batch_shopping' :
                       pattern.source.includes('emails') ? 'batch_emails' : 'batch_template',
               items }
    }
  }
  return null
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentContext, setCurrentContext] = useState('general')
  const [chatLogs, setChatLogs] = useState({
    general: [
      { role: 'assistant', text: 'Hi! I\'m your voice assistant. Try shortcuts like "task", "shop", "mail" or templates like "pool maintenance", "HVAC service".' }
    ],
    tasks: [],
    shopping: [],
    knowledge: [],
    email: [],
    files: []
  })
  const [error, setError] = useState(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    console.log('VoiceAssistant mounting...')
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
    console.log('SpeechRecognition supported:', !!SpeechRecognition)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatLogs, currentContext])

  // 🚀 QUICK WIN #4: Better Error Handling
  const showError = (message, type = 'error') => {
    setError({ message, type, timestamp: Date.now() })
    setTimeout(() => setError(null), 5000) // Auto-clear after 5 seconds
    
    // Add error to chat
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { 
        role: 'assistant', 
        text: `❌ ${message}`, 
        error: true 
      }]
    }))
  }

  const showSuccess = (message) => {
    setError({ message: `✅ ${message}`, type: 'success', timestamp: Date.now() })
    setTimeout(() => setError(null), 3000)
  }

  // Speech recognition setup
  useEffect(() => {
    if (!isSupported) return
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      const recognition = recognitionRef.current
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.onstart = () => {
        console.log('Voice recognition started')
        setIsListening(true)
        showSuccess('Listening...')
      }
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        console.log('Voice transcript:', transcript)
        setIsListening(false)
        handleSend(transcript)
      }
      recognition.onerror = (event) => {
        console.log('Voice recognition error:', event.error)
        setIsListening(false)
        showError(`Voice recognition error: ${event.error}`)
      }
      recognition.onend = () => {
        console.log('Voice recognition ended')
        setIsListening(false)
      }
    } catch (error) {
      console.error('Error setting up speech recognition:', error)
      setIsSupported(false)
      showError('Failed to initialize voice recognition')
    }
  }, [isSupported])

  const startListening = () => {
    if (!isOnline) {
      showError('Offline, can\'t listen')
      return
    }
    if (!isSupported) {
      showError('Voice recognition not supported in this browser')
      return
    }
    try {
      recognitionRef.current?.start()
    } catch (error) {
      console.error('Error starting voice recognition:', error)
      showError('Failed to start voice recognition')
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch (error) {
      console.error('Error stopping voice recognition:', error)
    }
  }

  // Enhanced command parsing with shortcuts and templates
  function parseCommandFallback(command) {
    const cmd = command.toLowerCase()
    
    // Check for shortcuts first
    for (const [shortcut, action] of Object.entries(VOICE_SHORTCUTS)) {
      if (cmd.includes(shortcut)) {
        return { action, parameters: { original: command } }
      }
    }
    
    // Check for templates
    for (const [template, data] of Object.entries(SMART_TEMPLATES)) {
      if (cmd.includes(template)) {
        return { action: 'apply_template', parameters: { template, data } }
      }
    }
    
    // Check for batch operations
    const batchResult = parseBatchCommand(command)
    if (batchResult) {
      return batchResult
    }
    
    // Standard command parsing
    if (cmd.includes('task')) return { action: 'add_task', parameters: { task: command.replace(/add task/i, '').trim() } }
    if (cmd.includes('shopping')) return { action: 'add_shopping', parameters: { shopping_items: command.replace(/add to shopping/i, '').trim() } }
    if (cmd.includes('email')) return { action: 'send_email', parameters: { email_subject: command.replace(/send email/i, '').trim() } }
    if (cmd.includes('knowledge')) return { action: 'search_knowledge', parameters: { search_query: command.replace(/search knowledge/i, '').trim() } }
    if (cmd.includes('file')) return { action: 'upload_file' }
    if (cmd.includes('go to')) return { action: 'navigate', navigation: '/' + cmd.split('go to')[1].trim() }
    
    return { action: 'clarify', clarification: 'Sorry, I didn\'t understand. Try shortcuts like "task", "shop", "mail" or templates like "pool maintenance".' }
  }

  async function handleSend(text) {
    if (!text.trim()) return
    console.log('Sending message:', text)
    
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: 'user', text }]
    }))
    
    setIsProcessing(true)
    
    try {
      const action = parseCommandFallback(text)
      await handleAction(action, text)
    } catch (e) {
      console.error('Error processing message:', e)
      showError('Error processing your request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleAction(action, userText) {
    if (!action) return
    
    let reply = ''
    let context = currentContext
    
    try {
      switch (action.action) {
        case 'add_task':
          reply = `✅ Task added: ${action.parameters?.task || userText}`
          context = 'tasks'
          break
        case 'add_shopping':
          reply = `🛒 Added to shopping: ${action.parameters?.shopping_items || userText}`
          context = 'shopping'
          break
        case 'send_email':
          reply = `📧 Email composed: ${action.parameters?.email_subject || userText}`
          context = 'email'
          break
        case 'search_knowledge':
          reply = `🔍 Knowledge search: ${action.parameters?.search_query || userText}`
          context = 'knowledge'
          break
        case 'upload_file':
          reply = '📁 Ready to upload a file!'
          context = 'files'
          break
        case 'navigate':
          reply = `🧭 Navigating to ${action.navigation || userText}`
          break
        case 'apply_template':
          const template = action.parameters.template
          const data = action.parameters.data
          reply = `📋 Applied template: ${template}\n\nTasks: ${data.tasks.join(', ')}\nShopping: ${data.shopping.join(', ')}\nNotes: ${data.notes}`
          context = 'tasks'
          break
        case 'batch_tasks':
          const tasks = action.items
          reply = `✅ Added ${tasks.length} tasks:\n${tasks.map(task => `• ${task}`).join('\n')}`
          context = 'tasks'
          break
        case 'batch_shopping':
          const items = action.items
          reply = `🛒 Added ${items.length} items to shopping:\n${items.map(item => `• ${item}`).join('\n')}`
          context = 'shopping'
          break
        case 'urgent_tasks':
          reply = '🚨 Showing urgent tasks...'
          context = 'tasks'
          break
        case 'due_today':
          reply = '📅 Showing tasks due today...'
          context = 'tasks'
          break
        case 'show_help':
          reply = `🎯 Quick shortcuts: "task", "shop", "mail", "find", "pic", "now", "today"\n📋 Templates: "pool maintenance", "HVAC service", "monthly inspection", "emergency repair", "weekly cleaning"\n📦 Batch: "add multiple tasks: item1, item2, item3"`
          break
        case 'clear_chat':
          setChatLogs(logs => ({ ...logs, [currentContext]: [] }))
          reply = '🗑️ Chat cleared'
          break
        case 'save_notes':
          reply = '💾 Notes saved'
          break
        case 'clarify':
          reply = action.clarification || 'Can you clarify?'
          break
        default:
          reply = 'I understand. How can I help you with that?'
      }
      
      setChatLogs(logs => ({
        ...logs,
        [context]: [...logs[context], { role: 'assistant', text: reply }]
      }))
      
      if (context !== currentContext) {
        setCurrentContext(context)
      }
      
      showSuccess('Action completed successfully')
      
    } catch (error) {
      console.error('Error in handleAction:', error)
      showError('Failed to complete action. Please try again.')
    }
  }

  function handleInputKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isProcessing) {
        handleSend(input)
        setInput('')
      }
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f9f9fb' }}>
      {/* Error/Success Messages */}
      {error && (
        <div style={{
          position: 'fixed',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 20px',
          borderRadius: 8,
          background: error.type === 'success' ? '#d4edda' : '#f8d7da',
          color: error.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${error.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          zIndex: 1000,
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {error.type === 'success' ? <Zap size={16} /> : <AlertCircle size={16} />}
          {error.message}
        </div>
      )}

      {/* Context Tabs/Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff', zIndex: 2 }}>
        {CONTEXTS.map(ctx => (
          <button
            key={ctx.key}
            onClick={() => setCurrentContext(ctx.key)}
            style={{
              flex: 1,
              padding: '1rem',
              background: currentContext === ctx.key ? '#f0f4ff' : 'transparent',
              border: 'none',
              borderBottom: currentContext === ctx.key ? '2px solid #007bff' : '2px solid transparent',
              color: currentContext === ctx.key ? '#007bff' : '#888',
              fontWeight: currentContext === ctx.key ? 700 : 500,
              cursor: 'pointer',
              fontSize: 16,
              outline: 'none',
              transition: 'background 0.2s, border-bottom 0.2s'
            }}
          >
            {ctx.label}
          </button>
        ))}
      </div>
      
      {/* Quick Action Buttons */}
      <div style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          style={{ padding: '4px 8px', fontSize: 12, background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: 4, cursor: 'pointer' }}
        >
          🎯 Shortcuts
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          style={{ padding: '4px 8px', fontSize: 12, background: '#f3e5f5', border: '1px solid #9c27b0', borderRadius: 4, cursor: 'pointer' }}
        >
          📋 Templates
        </button>
        <button
          onClick={() => handleSend('show help')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#e8f5e8', border: '1px solid #4caf50', borderRadius: 4, cursor: 'pointer' }}
        >
          ❓ Help
        </button>
      </div>

      {/* Shortcuts Panel */}
      {showShortcuts && (
        <div style={{ padding: '12px 16px', background: '#e3f2fd', borderBottom: '1px solid #2196f3', fontSize: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>🎯 Quick Shortcuts:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(VOICE_SHORTCUTS).map(([shortcut, action]) => (
              <button
                key={shortcut}
                onClick={() => handleSend(shortcut)}
                style={{ padding: '4px 8px', background: '#fff', border: '1px solid #2196f3', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                {shortcut} → {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {showTemplates && (
        <div style={{ padding: '12px 16px', background: '#f3e5f5', borderBottom: '1px solid #9c27b0', fontSize: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 Smart Templates:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(SMART_TEMPLATES).map(template => (
              <button
                key={template}
                onClick={() => handleSend(template)}
                style={{ padding: '4px 8px', background: '#fff', border: '1px solid #9c27b0', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column' }}>
        {currentContext === 'profile' ? (
          <div style={{ padding: '2rem', color: '#222' }}>
            <h2>Profile & Analytics</h2>
            <p>Voice Assistant Profile</p>
            <div><b>Voice Supported:</b> {isSupported ? 'Yes' : 'No'}</div>
            <div><b>Online:</b> {isOnline ? 'Yes' : 'No'}</div>
            <div><b>Current Context:</b> {currentContext}</div>
            <div style={{ marginTop: 16 }}>
              <h3>Productivity Features:</h3>
              <div>✅ Voice shortcuts enabled</div>
              <div>✅ Smart templates available</div>
              <div>✅ Batch operations supported</div>
              <div>✅ Enhanced error handling</div>
            </div>
          </div>
        ) : (
          <>
            {chatLogs[currentContext].map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#007bff' : msg.error ? '#fff5f5' : '#fff',
                color: msg.role === 'user' ? '#fff' : msg.error ? '#e53e3e' : '#222',
                borderRadius: '18px',
                padding: '0.75rem 1.25rem',
                marginBottom: '0.5rem',
                maxWidth: '80%',
                boxShadow: msg.error ? '0 0 0 2px #e53e3e' : '0 1px 4px rgba(0,0,0,0.04)',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>
            ))}
          </>
        )}
        <div ref={chatEndRef} />
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', color: '#888', margin: '0.5rem 0' }}>
            <Loader size={18} className="spin" style={{ display: 'inline', marginRight: 8 }} />
            Processing...
          </div>
        )}
      </div>
      
      <form style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: '#fff', borderTop: '1px solid #eee' }} onSubmit={e => { e.preventDefault(); if (!isProcessing) handleSend(input); setInput('') }}>
        <button 
          type="button" 
          onClick={isListening ? stopListening : startListening} 
          style={{ background: 'none', border: 'none', marginRight: 8, cursor: 'pointer' }} 
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff color="#ff4d4f" /> : <Mic color="#007bff" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKey}
          placeholder={isListening ? 'Listening...' : 'Type a message or use shortcuts...'}
          disabled={isProcessing}
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 18, border: '1px solid #eee', fontSize: 16, outline: 'none', marginRight: 8 }}
        />
        <button 
          type="submit" 
          disabled={isProcessing || !input.trim()} 
          style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 18, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
        >
          <Send size={18} />
        </button>
      </form>
      
      <style>{`.spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  )
}

export default VoiceAssistant 