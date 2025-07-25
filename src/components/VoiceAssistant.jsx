import React, { useState, useEffect, useRef } from 'react'
<<<<<<< Updated upstream
import { API_KEYS } from '../lib/supabase'
import { Mic, MicOff, Loader, Send, HelpCircle, Paperclip, Image, File, Link } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { TABLES } from '../lib/supabase'
import { format } from 'date-fns'

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
=======
import { 
  Mic, 
  Square, 
  Send, 
  FileText, 
  ShoppingCart, 
  BookOpen, 
  Mail, 
  Camera, 
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'

const VoiceAssistant = ({ onTaskCreate, onShoppingAdd, onKnowledgeAdd, onEmailSend, onPhotoUpload, onFileUpload }) => {
>>>>>>> Stashed changes
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
<<<<<<< Updated upstream
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
  const [suggestion, setSuggestion] = useState(null)
  const [resourceSuggestions, setResourceSuggestions] = useState([])
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

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
=======
  const [conversationHistory, setConversationHistory] = useState([])
  const [currentAction, setCurrentAction] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [listeningTimeout, setListeningTimeout] = useState(null)
  
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(null)

  // Voice Commands and Intent Recognition
  const voiceCommands = {
    // Task Commands
    tasks: {
      keywords: ['task', 'fix', 'repair', 'maintenance', 'work', 'job', 'project', 'issue', 'problem'],
      examples: [
        'Add task to fix the leaky faucet',
        'Create a maintenance task for HVAC',
        'I need to repair the treadmill',
        'Add a task to check the pool equipment'
      ]
    },
    
    // Shopping Commands
    shopping: {
      keywords: ['buy', 'purchase', 'order', 'shop', 'supplies', 'parts', 'materials', 'tools', 'equipment'],
      examples: [
        'Add to shopping list: light bulbs',
        'I need to buy cleaning supplies',
        'Order new filters for the HVAC',
        'Add plumbing parts to shopping list'
      ]
    },
    
    // Knowledge Commands
    knowledge: {
      keywords: ['note', 'document', 'record', 'save', 'knowledge', 'information', 'procedure', 'manual', 'guide'],
      examples: [
        'Save this procedure to knowledge base',
        'Document the repair steps',
        'Add note about equipment maintenance',
        'Record troubleshooting steps'
      ]
    },
    
    // Email Commands
    email: {
      keywords: ['email', 'send', 'message', 'contact', 'notify', 'report', 'communicate'],
      examples: [
        'Send email to manager about the issue',
        'Email the repair report',
        'Contact the supplier about parts',
        'Send maintenance update'
      ]
    },
    
    // Photo Commands
    photos: {
      keywords: ['photo', 'picture', 'image', 'camera', 'capture', 'document', 'visual', 'before', 'after'],
      examples: [
        'Take photo of the damage',
        'Capture before and after images',
        'Document the repair with photos',
        'Save photo of the equipment'
      ]
    },
    
    // File Commands
    files: {
      keywords: ['file', 'upload', 'document', 'attachment', 'scan', 'pdf', 'manual', 'warranty'],
      examples: [
        'Upload the repair manual',
        'Save the warranty document',
        'Add the equipment manual',
        'Upload the invoice'
      ]
>>>>>>> Stashed changes
    }
  }

<<<<<<< Updated upstream
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
  async function saveMessageToSupabase(context, role, text, atts = []) {
    if (!userId) return
    await supabase.from('chat_logs').insert({
      user_id: userId,
      context,
      role,
      text,
      attachments: atts.length > 0 ? atts : null
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
    if (!text.trim() && attachments.length === 0) return
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: 'user', text, attachments: [...attachments] }]
    }))
    saveMessageToSupabase(currentContext, 'user', text, attachments)
    setAttachments([])
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
    let nextSuggestion = null
    switch (action.action) {
      case 'add_task':
        reply = `Task added: ${action.parameters?.task || userText}`
        nextSuggestion = {
          text: 'Would you like to add a shopping list for this task?',
          onClick: () => setInput('Add to shopping ' + (action.parameters?.task || ''))
        }
        break
      case 'add_shopping':
        reply = `Added to shopping: ${action.parameters?.shopping_items || userText}`
        nextSuggestion = {
          text: 'Would you like to link this shopping list to a task?',
          onClick: () => setInput('Add task ' + (action.parameters?.shopping_items || ''))
        }
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
    setSuggestion(nextSuggestion)
  }

  // Proactive reminders for due tasks
  useEffect(() => {
    if (currentContext !== 'tasks' || !userId) return
    const fetchDueTasks = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .lte('due_date', today)
      if (!error && data && data.length > 0) {
        setSuggestion({
          text: `You have ${data.length} task(s) due today. Want to review them?`,
          onClick: () => setInput('Show my due tasks')
        })
      }
    }
    fetchDueTasks()
  }, [currentContext, userId])

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

  // File upload functions
  async function uploadFile(file) {
    if (!userId) return null
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName)
      return {
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
      }
    } catch (error) {
      console.error('Upload error:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleFileUpload(event) {
    const files = Array.from(event.target.files)
    const uploaded = []
    for (const file of files) {
      const attachment = await uploadFile(file)
      if (attachment) uploaded.push(attachment)
    }
    setAttachments(prev => [...prev, ...uploaded])
    event.target.value = ''
  }

  // Attachment preview component
  function AttachmentPreview({ attachment }) {
    if (attachment.type.startsWith('image/')) {
      return (
        <div style={{ marginTop: 8 }}>
          <img src={attachment.url} alt={attachment.name} style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8 }} />
          <div style={{ fontSize: 12, color: '#666' }}>{attachment.name}</div>
        </div>
      )
    }
    return (
      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
        <File size={16} style={{ marginRight: 8 }} />
        <span style={{ flex: 1 }}>{attachment.name}</span>
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>Download</a>
      </div>
    )
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
              {resourceSuggestions.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <b>Related Resources:</b>
                  {resourceSuggestions.map((msg, i) => (
                    <div key={i} style={{ background: '#f0f8ff', border: '1px solid #bae7ff', borderRadius: 8, padding: '4px 10px', margin: '4px 0', fontSize: 14, cursor: 'pointer' }}
                      title={`From ${CONTEXTS.find(c=>c.key===msg.context)?.label}`}
                      onClick={() => {
                        setCurrentContext(msg.context)
                        setInput(msg.text)
                      }}>
                      <span style={{ fontWeight: 500, color: '#1890ff' }}>📎</span> {msg.text} <span style={{ color: '#888', fontSize: 12 }}>({CONTEXTS.find(c=>c.key===msg.context)?.label})</span>
                      {msg.tags && msg.tags.length > 0 && <span style={{ color: '#888', fontSize: 12 }}> [{msg.tags.join(', ')}]</span>}
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
                  {msg.attachments && msg.attachments.map((att, j) => (
                    <AttachmentPreview key={j} attachment={att} />
                  ))}
                </div>
              ))}
              {suggestion && (
                <div style={{ background: '#e6ffe6', border: '1px solid #52c41a', borderRadius: 8, padding: '8px 12px', margin: '8px 0', color: '#237804', fontSize: 15, cursor: 'pointer' }}
                  onClick={suggestion.onClick}>
                  💡 <b>Suggestion:</b> {suggestion.text}
                </div>
              )}
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
        <label style={{ marginRight: 8, cursor: 'pointer' }}>
          <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
          <Paperclip color="#007bff" />
        </label>
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
            
            // Suggest relevant resources from other contexts
            if (e.target.value.length > 2) {
              const allPins = Object.entries(chatLogs).flatMap(([ctx, msgs]) =>
                msgs.filter(m => m.pinned).map(m => ({ ...m, context: ctx }))
              )
              const relevant = allPins.filter(m =>
                m.context !== currentContext && (
                  (m.tags || []).some(tag => e.target.value.toLowerCase().includes(tag.toLowerCase())) ||
                  m.text.toLowerCase().includes(e.target.value.toLowerCase())
                )
              ).slice(0, 3)
              setResourceSuggestions(relevant)
            } else {
              setResourceSuggestions([])
            }
          }}
          onKeyDown={handleInputKey}
          placeholder={isListening ? 'Listening...' : 'Type a message...'}
          disabled={isProcessing}
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 18, border: '1px solid #eee', fontSize: 16, outline: 'none', marginRight: 8 }}
        />
        <button type="submit" disabled={isProcessing || (!input.trim() && attachments.length === 0)} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 18, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
          <Send size={18} />
        </button>
      </form>
      {attachments.length > 0 && (
        <div style={{ padding: '0 1rem 1rem', background: '#fff' }}>
          <b>Attachments:</b>
          {attachments.map((att, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <span style={{ flex: 1 }}>{att.name}</span>
              <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <style>{`.spin { animation: spin 1s linear infinite; }`}</style>
=======
  // Initialize Speech Recognition
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Voice recognition is not supported in this browser')
      return false
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    
    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setTranscript('')
      speak('Listening... Tell me what you need')
      
      // Auto-stop after 30 seconds to prevent getting stuck
      const timeout = setTimeout(() => {
        if (isListening) {
          stopListening()
          speak('Voice input timed out. Please try again.')
        }
      }, 30000)
      
      setListeningTimeout(timeout)
    }
    
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      setTranscript(finalTranscript + interimTranscript)
    }
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        speak('No speech detected. Please try again.')
      } else {
        speak(`Voice recognition error: ${event.error}`)
      }
    }
    
    recognitionRef.current.onend = () => {
      setIsListening(false)
      
      // Clear the timeout
      if (listeningTimeout) {
        clearTimeout(listeningTimeout)
        setListeningTimeout(null)
      }
      
      if (transcript.trim()) {
        // Check if it's a voice command first
        if (processVoiceCommand(transcript)) {
          setTranscript('')
          showMessage('success', 'Voice command processed! Task added automatically.')
        } else {
          // Regular voice input
          setUserInput(transcript)
          showMessage('success', 'Voice input captured! Click "Add Task" or speak again.')
        }
      }
    }
    
    return true
  }

  // Text-to-Speech
  const speak = (text) => {
    if (isMuted) return
    
    if ('speechSynthesis' in window) {
      if (synthesisRef.current) {
        speechSynthesis.cancel()
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      synthesisRef.current = utterance
      speechSynthesis.speak(utterance)
    }
  }

  // Intent Recognition
  const detectIntent = (input) => {
    const lowerInput = input.toLowerCase()
    
    // Check for specific commands first
    for (const [category, config] of Object.entries(voiceCommands)) {
      for (const keyword of config.keywords) {
        if (lowerInput.includes(keyword)) {
          return category
        }
      }
    }
    
    // Check for action words
    if (lowerInput.includes('add') || lowerInput.includes('create') || lowerInput.includes('new')) {
      if (lowerInput.includes('task') || lowerInput.includes('fix') || lowerInput.includes('repair')) {
        return 'tasks'
      }
      if (lowerInput.includes('shop') || lowerInput.includes('buy') || lowerInput.includes('purchase')) {
        return 'shopping'
      }
      if (lowerInput.includes('note') || lowerInput.includes('document') || lowerInput.includes('save')) {
        return 'knowledge'
      }
    }
    
    // Default to task if unclear
    return 'tasks'
  }

  // Process Voice Input
  const processVoiceInput = async (input) => {
    setIsProcessing(true)
    setCurrentAction('Processing your request...')
    
    const intent = detectIntent(input)
    const action = {
      type: intent,
      input: input,
      timestamp: new Date().toISOString()
    }
    
    setConversationHistory(prev => [...prev, action])
    
    try {
      switch (intent) {
        case 'tasks':
          await handleTaskCreation(input)
          break
        case 'shopping':
          await handleShoppingAdd(input)
          break
        case 'knowledge':
          await handleKnowledgeAdd(input)
          break
        case 'email':
          await handleEmailSend(input)
          break
        case 'photos':
          await handlePhotoUpload(input)
          break
        case 'files':
          await handleFileUpload(input)
          break
        default:
          speak('I\'m not sure what you want to do. Please try again.')
      }
    } catch (error) {
      console.error('Error processing voice input:', error)
      speak('Sorry, there was an error processing your request.')
    } finally {
      setIsProcessing(false)
      setCurrentAction(null)
      setTranscript('')
    }
  }

  // Handle Task Creation
  const handleTaskCreation = async (input) => {
    speak('Creating a task for you.')
    
    // Extract task details using AI-like processing
    const taskData = {
      task: input.replace(/^(add|create|new)\s+(task\s+)?/i, '').trim(),
      priority: input.toLowerCase().includes('urgent') || input.toLowerCase().includes('emergency') ? 'High' : 'Medium',
      category: detectTaskCategory(input),
      timing: detectTiming(input),
      estimatedTime: estimateTaskTime(input),
      complexity: estimateComplexity(input)
    }
    
    if (onTaskCreate) {
      onTaskCreate(taskData)
    }
    
    speak(`Task created: ${taskData.task}`)
  }

  // Handle Shopping Add
  const handleShoppingAdd = async (input) => {
    speak('Adding item to shopping list.')
    
    const item = input.replace(/^(add|buy|purchase|order)\s+(to\s+)?(shopping\s+)?(list\s+)?/i, '').trim()
    
    if (onShoppingAdd) {
      onShoppingAdd({
        item: item,
        priority: input.toLowerCase().includes('urgent') ? 'High' : 'Medium',
        category: detectShoppingCategory(item)
      })
    }
    
    speak(`Added to shopping list: ${item}`)
  }

  // Handle Knowledge Add
  const handleKnowledgeAdd = async (input) => {
    speak('Saving to knowledge base.')
    
    const knowledge = input.replace(/^(save|document|record|add)\s+(to\s+)?(knowledge\s+)?(base\s+)?/i, '').trim()
    
    if (onKnowledgeAdd) {
      onKnowledgeAdd({
        title: knowledge.split(' ').slice(0, 5).join(' ') + '...',
        content: knowledge,
        category: detectKnowledgeCategory(knowledge)
      })
    }
    
    speak('Knowledge saved successfully.')
  }

  // Handle Email Send
  const handleEmailSend = async (input) => {
    speak('Preparing email.')
    
    const emailData = {
      subject: extractEmailSubject(input),
      body: input,
      recipient: extractRecipient(input),
      priority: input.toLowerCase().includes('urgent') ? 'High' : 'Normal'
    }
    
    if (onEmailSend) {
      onEmailSend(emailData)
    }
    
    speak('Email prepared. Please review before sending.')
  }

  // Handle Photo Upload
  const handlePhotoUpload = async (input) => {
    speak('Opening camera for photo capture.')
    
    if (onPhotoUpload) {
      onPhotoUpload({
        description: input,
        category: detectPhotoCategory(input)
      })
    }
  }

  // Handle File Upload
  const handleFileUpload = async (input) => {
    speak('Opening file upload.')
    
    if (onFileUpload) {
      onFileUpload({
        description: input,
        category: detectFileCategory(input)
      })
    }
  }

  // Helper Functions for Intent Processing
  const detectTaskCategory = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('hvac') || lower.includes('air') || lower.includes('heating')) return 'HVAC'
    if (lower.includes('plumb') || lower.includes('water') || lower.includes('pipe')) return 'Plumbing'
    if (lower.includes('electr') || lower.includes('light') || lower.includes('power')) return 'Electrical'
    if (lower.includes('clean') || lower.includes('maintenance')) return 'Cleaning'
    if (lower.includes('equipment') || lower.includes('machine')) return 'Equipment'
    return 'General'
  }

  const detectTiming = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('today') || lower.includes('now') || lower.includes('urgent')) return 'today'
    if (lower.includes('tomorrow')) return 'tomorrow'
    if (lower.includes('this week')) return 'this_week'
    return 'when_possible'
  }

  const estimateTaskTime = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('quick') || lower.includes('simple') || lower.includes('minor')) return 30
    if (lower.includes('major') || lower.includes('complex') || lower.includes('replace')) return 120
    return 60
  }

  const estimateComplexity = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('simple') || lower.includes('quick') || lower.includes('minor')) return 'low'
    if (lower.includes('complex') || lower.includes('major') || lower.includes('replace')) return 'high'
    return 'medium'
  }

  const detectShoppingCategory = (item) => {
    const lower = item.toLowerCase()
    if (lower.includes('light') || lower.includes('bulb')) return 'Electrical'
    if (lower.includes('filter') || lower.includes('hvac')) return 'HVAC'
    if (lower.includes('clean') || lower.includes('supply')) return 'Cleaning'
    if (lower.includes('tool')) return 'Tools'
    return 'General'
  }

  const detectKnowledgeCategory = (content) => {
    const lower = content.toLowerCase()
    if (lower.includes('procedure') || lower.includes('step')) return 'Procedures'
    if (lower.includes('troubleshoot') || lower.includes('fix')) return 'Troubleshooting'
    if (lower.includes('maintenance') || lower.includes('service')) return 'Maintenance'
    return 'General'
  }

  const extractEmailSubject = (input) => {
    const words = input.split(' ')
    return words.slice(0, 6).join(' ') + '...'
  }

  const extractRecipient = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('manager') || lower.includes('supervisor')) return 'manager@lifetime.com'
    if (lower.includes('supplier') || lower.includes('vendor')) return 'supplier@company.com'
    return 'maintenance@lifetime.com'
  }

  const detectPhotoCategory = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('damage') || lower.includes('issue')) return 'Issues'
    if (lower.includes('before') || lower.includes('after')) return 'Before/After'
    if (lower.includes('equipment')) return 'Equipment'
    return 'General'
  }

  const detectFileCategory = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('manual') || lower.includes('guide')) return 'Manuals'
    if (lower.includes('warranty')) return 'Warranties'
    if (lower.includes('invoice') || lower.includes('receipt')) return 'Invoices'
    return 'General'
  }

  // Start/Stop Listening
  const startListening = () => {
    if (initializeSpeechRecognition()) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    // Clear the timeout
    if (listeningTimeout) {
      clearTimeout(listeningTimeout)
      setListeningTimeout(null)
    }
    
    // Stop the recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
    }
    
    setIsListening(false)
    speak('Voice input stopped.')
  }

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      speechSynthesis.cancel()
    }
  }

  // Show message function
  const showMessage = (type, text) => {
    // For now, just log the message
    console.log(`${type}: ${text}`)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      width: '400px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🎤 Voice Assistant</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <FileText size={16} />
          </button>
        </div>
      </div>

      {/* Main Interface */}
      <div style={{ padding: '1rem' }}>
        {/* Status */}
        {isProcessing && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--warning-color)',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            {currentAction}
          </div>
        )}

        {/* Listening Status */}
        {isListening && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'white',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }}></div>
            🎤 LISTENING - Click "STOP LISTENING" to stop
          </div>
        )}

        {/* Voice Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            width: '100%',
            padding: '1.5rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isListening ? '#dc3545' : 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            boxShadow: isListening ? '0 0 20px rgba(220, 53, 69, 0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
            animation: isListening ? 'pulse 2s infinite' : 'none'
          }}
        >
          {isListening ? (
            <>
              <Square size={24} />
              STOP LISTENING
            </>
          ) : (
            <>
              <Mic size={24} />
              Start Voice Assistant
            </>
          )}
        </button>

        {/* Transcript */}
        {transcript && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--light-color)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: 'var(--text-color)',
            minHeight: '40px'
          }}>
            <strong>You said:</strong> {transcript}
          </div>
        )}

        {/* Voice Commands Help */}
        <div style={{
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--secondary-color)',
          lineHeight: '1.4'
        }}>
          <strong>Voice Commands:</strong><br />
          • "Add task to fix the leaky faucet"<br />
          • "Buy light bulbs for the gym"<br />
          • "Save this repair procedure"<br />
          • "Send email about the HVAC issue"<br />
          • "Take photo of the damage"<br />
          • "Upload the equipment manual"<br />
          <br />
          <strong>💡 Tip:</strong> Click "STOP LISTENING" when you're done speaking, or it will auto-stop after 30 seconds.
        </div>
      </div>

      {/* Conversation History */}
      {showHistory && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Recent Actions</h4>
            {conversationHistory.slice(-5).reverse().map((action, index) => (
              <div key={index} style={{
                padding: '0.5rem',
                backgroundColor: 'var(--light-color)',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                  {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                </div>
                <div style={{ color: 'var(--text-color)' }}>{action.input}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--secondary-color)' }}>
                  {new Date(action.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Animation for Pulse Effect */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
>>>>>>> Stashed changes
    </div>
  )
}

export default VoiceAssistant 