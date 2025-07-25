import React, { useState, useEffect, useRef } from 'react'
import { API_KEYS } from '../lib/supabase'
import { Mic, MicOff, Loader, Send, HelpCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CONTEXTS = [
  { key: 'general', label: 'General' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'email', label: 'Email' },
  { key: 'files', label: 'Files' },
]

const PROFILE_UPDATE_INTERVAL = 10 // messages

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentContext, setCurrentContext] = useState('general')
  const [chatLogs, setChatLogs] = useState({
    general: [
      { role: 'assistant', text: 'Hi! I\'m your assistant. You can talk or type to me about tasks, shopping, emails, and more.' }
    ],
    tasks: [],
    shopping: [],
    knowledge: [],
    email: [],
    files: []
  })
  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [userId, setUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    const recognition = recognitionRef.current
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)
      handleSend(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    return () => { recognition.stop() }
  }, [isSupported])

  // Fetch user ID on mount
  useEffect(() => {
    const session = supabase.auth.getSession ? null : supabase.auth.session
    if (supabase.auth.getSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUserId(session?.user?.id || null)
      })
    } else {
      setUserId(session?.user?.id || null)
    }
  }, [])

  // Load chat logs from Supabase on mount or when userId changes
  useEffect(() => {
    if (!userId) return
    setIsLoadingLogs(true)
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })
      if (error) {
        setIsLoadingLogs(false)
        return
      }
      // Group logs by context
      const grouped = CONTEXTS.reduce((acc, ctx) => {
        acc[ctx.key] = []
        return acc
      }, {})
      data.forEach(row => {
        if (grouped[row.context]) grouped[row.context].push({ role: row.role, text: row.text })
      })
      // Always greet in general if empty
      if (grouped.general.length === 0) grouped.general.push({ role: 'assistant', text: 'Hi! I\'m your assistant. You can talk or type to me about tasks, shopping, emails, and more.' })
      setChatLogs(grouped)
      setIsLoadingLogs(false)
    }
    fetchLogs()
  }, [userId])

  // Fetch user profile on load
  useEffect(() => {
    if (!userId) return
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_data')
        .eq('user_id', userId)
        .single()
      if (!error && data) setProfile(data.profile_data)
    }
    fetchProfile()
  }, [userId])

  // Update profile after every PROFILE_UPDATE_INTERVAL messages
  useEffect(() => {
    if (!userId) return
    if (messageCount > 0 && messageCount % PROFILE_UPDATE_INTERVAL === 0) {
      updateUserProfile()
    }
  }, [messageCount, userId])

  // Save a message to Supabase
  async function saveMessageToSupabase(context, role, text) {
    if (!userId) return
    await supabase.from('chat_logs').insert({
      user_id: userId,
      context,
      role,
      text
    })
  }

  // Utility: Analyze logs and update profile
  async function updateUserProfile() {
    // Simple learning: count actions, favorite context, most used words
    const allLogs = Object.entries(chatLogs).flatMap(([context, msgs]) =>
      msgs.map(m => ({ ...m, context }))
    )
    const wordCounts = {}
    let favoriteContext = 'general'
    const contextCounts = {}
    allLogs.forEach(m => {
      if (m.role === 'user') {
        m.text.split(/\s+/).forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1
        })
        contextCounts[m.context] = (contextCounts[m.context] || 0) + 1
      }
    })
    favoriteContext = Object.entries(contextCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'
    const profileData = {
      favoriteContext,
      wordCounts,
      lastUpdated: new Date().toISOString()
    }
    setProfile(profileData)
    await supabase.from('user_profiles').upsert({
      user_id: userId,
      profile_data: profileData,
      updated_at: new Date().toISOString()
    })
  }

  const startListening = () => {
    if (!isOnline) return showError('Offline, can\'t listen')
    if (!isSupported) return showError('Voice recognition not supported')
    try { recognitionRef.current?.start() } catch {}
  }
  const stopListening = () => recognitionRef.current?.stop()

  function showError(msg) {
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: 'assistant', text: msg, error: true }]
    }))
    saveMessageToSupabase(currentContext, 'assistant', msg)
  }

  function getContextFromAction(action) {
    switch (action?.action) {
      case 'add_task': return 'tasks'
      case 'add_shopping': return 'shopping'
      case 'search_knowledge': return 'knowledge'
      case 'send_email': return 'email'
      case 'upload_file': return 'files'
      default: return 'general'
    }
  }

  async function handleSend(text) {
    if (!text.trim()) return
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: 'user', text }]
    }))
    saveMessageToSupabase(currentContext, 'user', text)
    setMessageCount(c => c + 1)
    setIsProcessing(true)
    try {
      const anthropicApiKey = API_KEYS.ANTHROPIC
      let action = null
      if (!anthropicApiKey || anthropicApiKey === 'your-anthropic-key') {
        action = parseCommandFallback(text)
      } else {
        const profilePrompt = profile ? `\n\nUser Profile: ${JSON.stringify(profile)}` : ''
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
                content: `Parse this voice or text command for a maintenance management app and determine the intended action.\n\nCommand: "${text}"${profilePrompt}\n\nAvailable Actions:\n1. Navigation: \"go to [page]\" → /tasks, /shopping, /email, /photos, /maintenance\n2. Task Management: \"add task [description]\"\n3. Email: \"send email [recipient] [subject]\"\n4. Shopping: \"add to shopping [items]\"\n5. Knowledge: \"search knowledge [query]\"\n6. Files: \"upload file\"\nIf unclear, ask a clarifying question.\nReturn as JSON.`
              }
            ]
          })
        })
        const data = await response.json()
        let parsed = null
        try {
          parsed = JSON.parse(data?.content?.[0]?.text || data?.content || '{}')
        } catch {}
        action = parsed || { action: 'clarify', clarification: 'Sorry, I didn\'t understand. Can you rephrase?' }
      }
      await handleAction(action, text)
    } catch (e) {
      showError('Error processing your request.')
    } finally {
      setIsProcessing(false)
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

  async function handleAction(action, userText) {
    if (!action) return showError('No action detected.')
    const context = getContextFromAction(action)
    if (action.action === 'clarify') {
      setChatLogs(logs => ({
        ...logs,
        [context]: [...logs[context], { role: 'assistant', text: action.clarification || 'Can you clarify?' }]
      }))
      setCurrentContext(context)
      return
    }
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
      default:
        reply = 'Action completed.'
    }
    setChatLogs(logs => ({
      ...logs,
      [context]: [...logs[context], { role: 'assistant', text: reply }]
    }))
    saveMessageToSupabase(context, 'assistant', reply)
    setCurrentContext(context)
  }

  function handleInputKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isProcessing) handleSend(input)
      setInput('')
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
        {isLoadingLogs ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
            <Loader size={32} className="spin" /> Loading conversation...
          </div>
        ) : (
          chatLogs[currentContext].map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#007bff' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#222',
              borderRadius: '18px',
              padding: '0.75rem 1.25rem',
              marginBottom: '0.5rem',
              maxWidth: '80%',
              boxShadow: msg.error ? '0 0 0 2px #ff4d4f' : '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              {msg.text}
            </div>
          ))
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
        <button type="button" onClick={isListening ? stopListening : startListening} style={{ background: 'none', border: 'none', marginRight: 8, cursor: 'pointer' }} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
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
        <button type="submit" disabled={isProcessing || !input.trim()} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 18, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
          <Send size={18} />
        </button>
      </form>
      <style>{`.spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  )
}

export default VoiceAssistant 