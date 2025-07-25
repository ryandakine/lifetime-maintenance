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
  { key: 'profile', label: 'Profile' },
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
  const [showMemoryManager, setShowMemoryManager] = useState(false)
  // Update memoryEdit state to include pinned and tags
  const [memoryEdit, setMemoryEdit] = useState({ index: null, text: '', role: 'user', pinned: false, tags: [] })
  const [searchTerm, setSearchTerm] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [suggestedMemory, setSuggestedMemory] = useState(null)

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
    const allLogs = Object.entries(chatLogs).flatMap(([context, msgs]) =>
      msgs.map(m => ({ ...m, context }))
    )
    const wordCounts = {}
    const phraseCounts = {}
    let favoriteContext = 'general'
    const contextCounts = {}
    const actionCounts = {}
    const hourCounts = Array(24).fill(0)
    allLogs.forEach(m => {
      if (m.role === 'user') {
        // Words
        m.text.split(/\s+/).forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1
        })
        // Phrases (bigrams)
        const words = m.text.split(/\s+/)
        for (let i = 0; i < words.length - 1; i++) {
          const phrase = words[i] + ' ' + words[i + 1]
          phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1
        }
        // Context
        contextCounts[m.context] = (contextCounts[m.context] || 0) + 1
        // Actions (simple intent guess)
        if (m.text.match(/add task|task/i)) actionCounts['add_task'] = (actionCounts['add_task'] || 0) + 1
        if (m.text.match(/shopping|add to shopping/i)) actionCounts['add_shopping'] = (actionCounts['add_shopping'] || 0) + 1
        if (m.text.match(/email|send email/i)) actionCounts['send_email'] = (actionCounts['send_email'] || 0) + 1
        if (m.text.match(/knowledge|search knowledge/i)) actionCounts['search_knowledge'] = (actionCounts['search_knowledge'] || 0) + 1
        if (m.text.match(/file|upload file/i)) actionCounts['upload_file'] = (actionCounts['upload_file'] || 0) + 1
        // Time of day
        if (m.timestamp) {
          const hour = new Date(m.timestamp).getHours()
          hourCounts[hour]++
        }
      }
    })
    favoriteContext = Object.entries(contextCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'
    // Most common phrases
    const topPhrases = Object.entries(phraseCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    // Most common actions
    const topActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])
    // Most active hours
    const topHours = hourCounts.map((count, hour) => ({ hour, count })).sort((a, b) => b.count - a.count).slice(0, 3)
    // Placeholder sentiment
    const sentiment = 'neutral'
    const profileData = {
      favoriteContext,
      wordCounts,
      topPhrases,
      topActions,
      topHours,
      sentiment,
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

  // Memory management functions
  function openMemoryManager() { setShowMemoryManager(true) }
  function closeMemoryManager() { setShowMemoryManager(false); setMemoryEdit({ index: null, text: '', role: 'user' }) }
  // Update memoryEdit state to include pinned and tags
  function startEditMemory(i, msg) {
    setMemoryEdit({
      index: i,
      text: msg.text,
      role: msg.role,
      pinned: msg.pinned || false,
      tags: msg.tags || []
    })
  }
  function cancelEditMemory() { setMemoryEdit({ index: null, text: '', role: 'user' }) }
  async function saveEditMemory() {
    setChatLogs(logs => {
      const updated = [...logs[currentContext]]
      updated[memoryEdit.index] = {
        ...updated[memoryEdit.index],
        text: memoryEdit.text,
        pinned: memoryEdit.pinned,
        tags: memoryEdit.tags
      }
      return { ...logs, [currentContext]: updated }
    })
    await supabase
      .from('chat_logs')
      .update({ text: memoryEdit.text, pinned: memoryEdit.pinned, tags: memoryEdit.tags })
      .match({ user_id: userId, context: currentContext, role: memoryEdit.role, text: chatLogs[currentContext][memoryEdit.index].text })
    cancelEditMemory()
  }
  async function deleteMemory(i) {
    const msg = chatLogs[currentContext][i]
    setChatLogs(logs => {
      const updated = [...logs[currentContext]]
      updated.splice(i, 1)
      return { ...logs, [currentContext]: updated }
    })
    await supabase
      .from('chat_logs')
      .delete()
      .match({ user_id: userId, context: currentContext, role: msg.role, text: msg.text })
  }
  async function addMemory() {
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: memoryEdit.role, text: memoryEdit.text }]
    }))
    await supabase.from('chat_logs').insert({
      user_id: userId,
      context: currentContext,
      role: memoryEdit.role,
      text: memoryEdit.text
    })
    cancelEditMemory()
  }
  // Update memory management functions for pinning and tags
  async function togglePinMemory(i) {
    const msg = chatLogs[currentContext][i]
    setChatLogs(logs => {
      const updated = [...logs[currentContext]]
      updated[i] = { ...updated[i], pinned: !updated[i].pinned }
      return { ...logs, [currentContext]: updated }
    })
    await supabase
      .from('chat_logs')
      .update({ pinned: !msg.pinned })
      .match({ user_id: userId, context: currentContext, role: msg.role, text: msg.text })
  }
  async function addTagToMemory(i, tag) {
    const msg = chatLogs[currentContext][i]
    const tags = Array.from(new Set([...(msg.tags || []), tag]))
    setChatLogs(logs => {
      const updated = [...logs[currentContext]]
      updated[i] = { ...updated[i], tags }
      return { ...logs, [currentContext]: updated }
    })
    await supabase
      .from('chat_logs')
      .update({ tags })
      .match({ user_id: userId, context: currentContext, role: msg.role, text: msg.text })
  }
  async function removeTagFromMemory(i, tag) {
    const msg = chatLogs[currentContext][i]
    const tags = (msg.tags || []).filter(t => t !== tag)
    setChatLogs(logs => {
      const updated = [...logs[currentContext]]
      updated[i] = { ...updated[i], tags }
      return { ...logs, [currentContext]: updated }
    })
    await supabase
      .from('chat_logs')
      .update({ tags })
      .match({ user_id: userId, context: currentContext, role: msg.role, text: msg.text })
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
          currentContext === 'profile' ? (
            <div style={{ padding: '2rem', color: '#222' }}>
              <h2>Profile & Analytics</h2>
              {profile ? (
                <>
                  <div><b>Favorite Context:</b> {profile.favoriteContext}</div>
                  <div><b>Top Words:</b> {Object.entries(profile.wordCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w,c])=>`${w} (${c})`).join(', ')}</div>
                  <div><b>Top Phrases:</b> {profile.topPhrases.map(([p,c])=>`${p} (${c})`).join(', ')}</div>
                  <div><b>Top Actions:</b> {profile.topActions.map(([a,c])=>`${a} (${c})`).join(', ')}</div>
                  <div><b>Most Active Hours:</b> {profile.topHours.map(h=>`${h.hour}:00 (${h.count})`).join(', ')}</div>
                  <div><b>Sentiment:</b> {profile.sentiment}</div>
                  <div><b>Last Updated:</b> {profile.lastUpdated}</div>
                  <div style={{ marginTop: '1rem' }}>
                    <button style={{ marginRight: 8 }}>Export Profile</button>
                    <button>Clear Profile/History</button>
                  </div>
                </>
              ) : <div>Loading profile...</div>}
            </div>
          ) : (
            <>
              {currentContext !== 'profile' && (
                <div style={{ marginBottom: 8, textAlign: 'right' }}>
                  <button onClick={openMemoryManager} style={{ fontSize: 14 }}>Manage Memories</button>
                </div>
              )}
              {showMemoryManager && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', padding: 24, borderRadius: 12, minWidth: 320, maxWidth: 480 }}>
                    <h3>Manage Memories ({CONTEXTS.find(c=>c.key===currentContext)?.label})</h3>
                    <div style={{ marginBottom: 8 }}>
                      <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search memories..." style={{ width: '60%', marginRight: 8 }} />
                      <input value={tagFilter} onChange={e=>setTagFilter(e.target.value)} placeholder="Filter by tag..." style={{ width: '30%' }} />
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                      {chatLogs[currentContext]
                        .map((msg, i) => ({ ...msg, i }))
                        .filter(msg => (!searchTerm || msg.text.toLowerCase().includes(searchTerm.toLowerCase())) && (!tagFilter || (msg.tags||[]).includes(tagFilter)))
                        .map((msg, i) => (
                          <div key={i} style={{ borderBottom: '1px solid #eee', padding: 8, display: 'flex', alignItems: 'center', background: msg.pinned ? '#fffbe6' : undefined }}>
                            <span style={{ flex: 1 }}>
                              <button onClick={()=>togglePinMemory(msg.i)} style={{ marginRight: 4 }}>{msg.pinned ? '★' : '☆'}</button>
                              {msg.role}: {memoryEdit.index === msg.i ? (
                                <input value={memoryEdit.text} onChange={e=>setMemoryEdit(m=>({...m,text:e.target.value}))} style={{ width: '60%' }} />
                              ) : msg.text}
                              <span style={{ marginLeft: 8 }}>
                                {(msg.tags||[]).map(tag => (
                                  <span key={tag} style={{ background: '#e0e0e0', borderRadius: 8, padding: '2px 6px', marginRight: 4, fontSize: 12 }}>
                                    {tag} <button onClick={()=>removeTagFromMemory(msg.i, tag)} style={{ fontSize: 10, marginLeft: 2 }}>x</button>
                                  </span>
                                ))}
                                {memoryEdit.index === msg.i ? (
                                  <input value={memoryEdit.tags.join(',')} onChange={e=>setMemoryEdit(m=>({...m,tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}))} placeholder="tags..." style={{ width: 60, marginLeft: 4 }} />
                                ) : (
                                  <input placeholder="+tag" style={{ width: 40, marginLeft: 4 }} onKeyDown={e=>{if(e.key==='Enter'){addTagToMemory(msg.i,e.target.value);e.target.value=''}}} />
                                )}
                              </span>
                            </span>
                            {memoryEdit.index === msg.i ? (
                              <>
                                <button onClick={saveEditMemory} style={{ marginLeft: 4 }}>Save</button>
                                <button onClick={cancelEditMemory} style={{ marginLeft: 4 }}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={()=>startEditMemory(msg.i,msg)} style={{ marginLeft: 4 }}>Edit</button>
                                <button onClick={()=>deleteMemory(msg.i)} style={{ marginLeft: 4 }}>Delete</button>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <input value={memoryEdit.index===null?memoryEdit.text:''} onChange={e=>setMemoryEdit(m=>({...m,text:e.target.value}))} placeholder="Add new memory..." style={{ width: '80%' }} />
                      <select value={memoryEdit.role} onChange={e=>setMemoryEdit(m=>({...m,role:e.target.value}))} style={{ marginLeft: 4 }}>
                        <option value="user">user</option>
                        <option value="assistant">assistant</option>
                      </select>
                      <button onClick={addMemory} style={{ marginLeft: 4 }}>Add</button>
                    </div>
                    <button onClick={closeMemoryManager}>Close</button>
                  </div>
                </div>
              )}
              {chatLogs[currentContext].filter(m=>m.pinned).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <b>Pinned Memories:</b>
                  {chatLogs[currentContext].filter(m=>m.pinned).map((msg, i) => (
                    <div key={i} style={{ background: '#fffbe6', borderRadius: 8, padding: '4px 10px', margin: '4px 0', fontSize: 14, cursor: 'pointer', border: '1px dashed #ffd700' }}
                      title="Click to insert into chat"
                      onClick={() => setInput(msg.text)}>
                      <span style={{ fontWeight: 500, color: '#bfa100' }}>★</span> {msg.text} {msg.tags && msg.tags.length > 0 && <span style={{ color: '#888', fontSize: 12 }}>[{msg.tags.join(', ')}]</span>}
                    </div>
                  ))}
                </div>
              )}
              {chatLogs[currentContext].map((msg, i) => (
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
              ))}
            </>
          )
        )}
        <div ref={chatEndRef} />
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', color: '#888', margin: '0.5rem 0' }}>
            <Loader size={18} className="spin" style={{ display: 'inline', marginRight: 8 }} />
            Thinking...
          </div>
        )}
      </div>
      {suggestedMemory && (
        <div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8, padding: '8px 12px', margin: '8px 0', color: '#0050b3', fontSize: 15 }}>
          <b>Suggested Memory:</b> {suggestedMemory.text} {suggestedMemory.tags && suggestedMemory.tags.length > 0 && <span style={{ color: '#888', fontSize: 12 }}>[{suggestedMemory.tags.join(', ')}]</span>}
          <button style={{ marginLeft: 8, fontSize: 13 }} onClick={() => setInput(suggestedMemory.text)}>Insert</button>
        </div>
      )}
      <form style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: '#fff', borderTop: '1px solid #eee' }} onSubmit={e => { e.preventDefault(); if (!isProcessing) handleSend(input); setInput('') }}>
        <button type="button" onClick={isListening ? stopListening : startListening} style={{ background: 'none', border: 'none', marginRight: 8, cursor: 'pointer' }} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
          {isListening ? <MicOff color="#ff4d4f" /> : <Mic color="#007bff" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value)
            // Suggest pinned memory if input matches tag or keyword
            const pins = chatLogs[currentContext].filter(m => m.pinned)
            const match = pins.find(m =>
              (m.tags || []).some(tag => e.target.value.toLowerCase().includes(tag.toLowerCase())) ||
              m.text.toLowerCase().includes(e.target.value.toLowerCase())
            )
            setSuggestedMemory(match || null)
          }}
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