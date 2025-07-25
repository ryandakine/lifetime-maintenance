import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader, Send, HelpCircle, Paperclip, Image, File, Link } from 'lucide-react'

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

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentContext, setCurrentContext] = useState('general')
  const [chatLogs, setChatLogs] = useState({
    general: [
      { role: 'assistant', text: 'Hi! I\'m your voice assistant. You can talk or type to me about tasks, shopping, emails, and more.' }
    ],
    tasks: [],
    shopping: [],
    knowledge: [],
    email: [],
    files: []
  })
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
      }
      recognition.onend = () => {
        console.log('Voice recognition ended')
        setIsListening(false)
      }
    } catch (error) {
      console.error('Error setting up speech recognition:', error)
      setIsSupported(false)
    }
  }, [isSupported])

  const startListening = () => {
    if (!isOnline) {
      alert('Offline, can\'t listen')
      return
    }
    if (!isSupported) {
      alert('Voice recognition not supported in this browser')
      return
    }
    try {
      recognitionRef.current?.start()
    } catch (error) {
      console.error('Error starting voice recognition:', error)
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch (error) {
      console.error('Error stopping voice recognition:', error)
    }
  }

  function parseCommandFallback(command) {
    const cmd = command.toLowerCase()
    if (cmd.includes('task')) return { action: 'add_task', parameters: { task: command.replace(/add task/i, '').trim() } }
    if (cmd.includes('shopping')) return { action: 'add_shopping', parameters: { shopping_items: command.replace(/add to shopping/i, '').trim() } }
    if (cmd.includes('email')) return { action: 'send_email', parameters: { email_subject: command.replace(/send email/i, '').trim() } }
    if (cmd.includes('knowledge')) return { action: 'search_knowledge', parameters: { search_query: command.replace(/search knowledge/i, '').trim() } }
    if (cmd.includes('file')) return { action: 'upload_file' }
    if (cmd.includes('go to')) return { action: 'navigate', navigation: '/' + cmd.split('go to')[1].trim() }
    return { action: 'clarify', clarification: 'Sorry, I didn\'t understand. Can you rephrase?' }
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
      // Simple fallback parsing
      const action = parseCommandFallback(text)
      await handleAction(action, text)
    } catch (e) {
      console.error('Error processing message:', e)
      setChatLogs(logs => ({
        ...logs,
        [currentContext]: [...logs[currentContext], { role: 'assistant', text: 'Error processing your request.' }]
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleAction(action, userText) {
    if (!action) return
    
    let reply = ''
    switch (action.action) {
      case 'add_task':
        reply = `Task added: ${action.parameters?.task || userText}`
        break
      case 'add_shopping':
        reply = `Added to shopping: ${action.parameters?.shopping_items || userText}`
        break
      case 'send_email':
        reply = `Email composed: ${action.parameters?.email_subject || userText}`
        break
      case 'search_knowledge':
        reply = `Knowledge search: ${action.parameters?.search_query || userText}`
        break
      case 'upload_file':
        reply = 'Ready to upload a file!'
        break
      case 'navigate':
        reply = `Navigating to ${action.navigation || userText}`
        break
      case 'clarify':
        reply = action.clarification || 'Can you clarify?'
        break
      default:
        reply = 'I understand. How can I help you with that?'
    }
    
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: 'assistant', text: reply }]
    }))
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
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column' }}>
        {currentContext === 'profile' ? (
          <div style={{ padding: '2rem', color: '#222' }}>
            <h2>Profile & Analytics</h2>
            <p>Voice Assistant Profile</p>
            <div><b>Voice Supported:</b> {isSupported ? 'Yes' : 'No'}</div>
            <div><b>Online:</b> {isOnline ? 'Yes' : 'No'}</div>
            <div><b>Current Context:</b> {currentContext}</div>
          </div>
        ) : (
          <>
            {chatLogs[currentContext].map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#007bff' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#222',
                borderRadius: '18px',
                padding: '0.75rem 1.25rem',
                marginBottom: '0.5rem',
                maxWidth: '80%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
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
            Thinking...
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
          placeholder={isListening ? 'Listening...' : 'Type a message...'}
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