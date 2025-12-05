import React, { useState, useEffect, useRef, useMemo } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  ShoppingCart, 
  Search, 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Brain,
  Store,
  Package,
  MapPin,
  RotateCcw,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Filter,
  List,
  Grid,
  Mic,
  Copy,
  Lightbulb,
  Droplet,
  Paintbrush,
  Wrench,
  HelpCircle
} from 'lucide-react'

// Add color palette for Lifetime Fitness look
const LIFETIME_COLORS = {
  primary: '#1a3d2f', // dark green
  accent: '#bfc1c2',  // silver
  background: '#f5f6f7',
  white: '#fff',
  black: '#222',
  highlight: '#e6f4ea',
}

const Shopping = () => {
  console.log('Rendering Shopping')
  const [shoppingLists, setShoppingLists] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [userInput, setUserInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)
  const listeningTimeoutRef = useRef(null)
  const [activeList, setActiveList] = useState('main') // 'main' or 'misc'
  const [mainList, setMainList] = useState([])
  const [miscList, setMiscList] = useState([])
  const [suggestedItems, setSuggestedItems] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [reminder, setReminder] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiListening, setAiListening] = useState(false)
  const [aiTranscript, setAiTranscript] = useState('')
  const aiRecognitionRef = useRef(null)
  const aiListeningTimeoutRef = useRef(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceModalText, setVoiceModalText] = useState('')
  const [voiceModalListening, setVoiceModalListening] = useState(false)
  const voiceModalRecognitionRef = useRef(null)

  const COMMON_ITEMS = [
    'LED bulbs',
    'HVAC filter',
    'Toilet flapper',
    'Pipe wrench',
    'Outlet cover',
    'Paint roller',
    'Extension cord',
    'Concrete patch',
    'Caulk',
    'Screws',
    'Batteries',
    'WD-40',
    'Shop towels',
    'Zip ties',
    'Wire nuts'
  ]

  const CATEGORY_KEYWORDS = {
    Electrical: ['bulb', 'outlet', 'wire', 'extension cord', 'batteries', 'switch'],
    Plumbing: ['toilet', 'flapper', 'pipe', 'caulk'],
    Paint: ['paint', 'roller', 'brush'],
    Tools: ['wrench', 'screwdriver', 'zip ties'],
    Misc: []
  }
  const SUGGESTIONS = {
    'paint': ['Paint tray', 'Painter’s tape', 'Drop cloth'],
    'toilet': ['Wax ring', 'Toilet bolts'],
    'bulb': ['Light fixture', 'Dimmer switch'],
    'filter': ['Replacement filter', 'Filter cleaner'],
    'batteries': ['Battery tester'],
    'outlet': ['Outlet cover', 'GFCI outlet'],
    'pipe': ['Pipe tape', 'Pipe insulation'],
    'roller': ['Paint tray liner'],
    'wrench': ['Pipe wrench', 'Adjustable wrench'],
  }

  const CATEGORY_ICONS = {
    Electrical: <Lightbulb size={18} style={{ marginRight: 4 }} />,
    Plumbing: <Droplet size={18} style={{ marginRight: 4 }} />,
    Paint: <Paintbrush size={18} style={{ marginRight: 4 }} />,
    Tools: <Wrench size={18} style={{ marginRight: 4 }} />,
    Misc: <HelpCircle size={18} style={{ marginRight: 4 }} />
  }

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load shopping lists and tasks on component mount
  useEffect(() => {
    loadShoppingLists()
    loadTasks()
  }, [])

  // On mount, load both lists from localStorage (or Supabase in future)
  useEffect(() => {
    const main = JSON.parse(localStorage.getItem('shoppingList_main') || '[]')
    const misc = JSON.parse(localStorage.getItem('shoppingList_misc') || '[]')
    setMainList(main)
    setMiscList(misc)
  }, [])

  // Save lists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('shoppingList_main', JSON.stringify(mainList))
  }, [mainList])
  useEffect(() => {
    localStorage.setItem('shoppingList_misc', JSON.stringify(miscList))
  }, [miscList])

  // Handle voice commands
  useEffect(() => {
    const voiceShopping = localStorage.getItem('voiceShopping')
    if (voiceShopping) {
      setUserInput(voiceShopping)
      localStorage.removeItem('voiceShopping')
      // Auto-process the voice shopping list
      setTimeout(() => {
        processShoppingInput()
      }, 500)
    }
  }, [])

  const loadShoppingLists = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .select('*')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setShoppingLists(data || [])
      console.log('Shopping lists loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading shopping lists:', error)
      console.log('Shopping component: Data load failed, showing fallback')
      showMessage('error', 'Failed to load shopping lists')
      setShoppingLists([]) // Ensure empty state for fallback
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('id, task_list, status')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const processShoppingInput = async () => {
    if (!userInput.trim()) return

    try {
      setProcessing(true)
      const perplexityApiKey = API_KEYS.PERPLEXITY_PRO

      if (!perplexityApiKey || perplexityApiKey === 'your-perplexity-key') {
        console.warn('Perplexity Pro API key not configured, using fallback parsing')
        // Fallback: improved parsing for quantity and brand
        const items = userInput.split('\n').filter(line => line.trim()).map(itemLine => {
          // Try to extract quantity and brand
          const match = itemLine.match(/^(\d+)\s+([A-Za-z0-9\- ]+)?(.*)$/)
          let quantity = 1
          let name = itemLine.trim()
          let brand = ''
          if (match) {
            quantity = parseInt(match[1], 10)
            name = (match[2] + (match[3] || '')).trim()
          } else {
            // Try to extract brand if present (e.g., 'GE LED bulb')
            const brandMatch = itemLine.match(/^(\w+)\s+(.+)$/)
            if (brandMatch) {
              brand = brandMatch[1]
              name = brandMatch[2]
            }
          }
          return {
            name,
            quantity,
            brand,
          grainger_part: 'N/A',
          grainger_url: '',
          home_depot_aisle: 'N/A',
          }
        })
        addItemToActiveList(items)
      } else {
        // Use Perplexity Pro for AI parsing
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${perplexityApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'user',
                content: `Parse the following shopping list and return it in a JSON array of objects. Each object should have 'name', 'quantity', 'brand', 'grainger_part', 'grainger_url', 'home_depot_aisle'. If a part number or URL is not available, set it to 'N/A'. For example: [{"name": "LED bulbs", "quantity": 10, "brand": "GE", "grainger_part": "123456", "grainger_url": "https://www.grainger.com/part/123456", "home_depot_aisle": "Aisle 10"}, {"name": "HVAC filter", "quantity": 2, "brand": "Honeywell", "grainger_part": "789012", "grainger_url": "https://www.grainger.com/part/789012", "home_depot_aisle": "Aisle 5"}]`
              }
            ]
          })
        })

        if (!response.ok) {
          throw new Error(`Perplexity API error: ${response.statusText}`)
        }

        const data = await response.json()
        const messageContent = data.choices[0].message.content
        const parsedItems = JSON.parse(messageContent)
        addItemToActiveList(parsedItems)
      }
    } catch (error) {
      console.error('Error processing voice input:', error)
      showMessage('error', 'Failed to process voice input')
    } finally {
      setProcessing(false)
    }
  }

  const addItemToActiveList = (items) => {
    // Auto-categorize and suggest
    const categorized = items.map(item => {
      let category = 'Misc'
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => item.name.toLowerCase().includes(k))) {
          category = cat
          break
        }
      }
      return { ...item, category }
    })
    // AI suggestions
    let suggestions = []
    categorized.forEach(item => {
      for (const [key, suggs] of Object.entries(SUGGESTIONS)) {
        if (item.name.toLowerCase().includes(key)) {
          suggestions = [...suggestions, ...suggs]
        }
      }
    })
    setSuggestedItems(suggestions)
    // Smart reminders (if item bought >2x in last 30 days)
    const allItems = [...mainList, ...miscList, ...categorized]
    const freq = {}
    allItems.forEach(i => {
      if (!freq[i.name]) freq[i.name] = 0
      freq[i.name]++
    })
    const frequent = Object.entries(freq).filter(([_, count]) => count > 2).map(([name]) => name)
    if (frequent.length) setReminder(`Reminder: You often buy ${frequent.join(', ')}. Need again?`)
    // Analytics
    const completed = allItems.filter(i => i.checked).length
    const total = allItems.length
    const byCategory = {}
    allItems.forEach(i => {
      byCategory[i.category] = (byCategory[i.category] || 0) + 1
    })
    setAnalytics({ total, completed, byCategory })
    // Save
    if (activeList === 'main') {
      setMainList(prev => [...prev, ...categorized])
    } else {
      setMiscList(prev => [...prev, ...categorized])
    }
  }

  // Move item to Misc
  const moveToMisc = (index) => {
    const item = activeList === 'main' ? mainList[index] : miscList[index]
    if (activeList === 'main') {
      setMainList(mainList.filter((_, i) => i !== index))
      setMiscList(prev => [...prev, item])
    } else {
      setMiscList(miscList.filter((_, i) => i !== index))
      setMainList(prev => [...prev, item])
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // --- Smart Shopping Assistant handler ---
  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return
    setAiProcessing(true)
    setAiResponse('')
    // Compose a summary of purchase history
    const allItems = [...mainList, ...miscList]
    const history = allItems.map(i => `${i.quantity}x ${i.name} (${i.category})`).join(', ')
    const prompt = `User asked: "${aiQuery}". Here is their shopping history: ${history}. Based on this, give a smart, concise answer. If they ask what to buy this month, suggest items they buy often, are seasonal, or are due for replacement. If they ask about low stock, infer from frequency. Reply as a helpful assistant.`
    try {
      const perplexityApiKey = API_KEYS.PERPLEXITY_PRO
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a smart shopping assistant for maintenance and facility supplies.' },
            { role: 'user', content: prompt }
          ]
        })
      })
      if (!response.ok) throw new Error('AI API error')
      const data = await response.json()
      setAiResponse(data.choices[0].message.content)
    } catch (e) {
      setAiResponse('Sorry, I could not process your request.')
    } finally {
      setAiProcessing(false)
    }
  }

  // Voice input for Smart Shopping Assistant
  const startAiListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.')
      return
    }
    
    // Stop any existing recognition first
    if (aiRecognitionRef.current) {
      aiRecognitionRef.current.stop()
      aiRecognitionRef.current.abort()
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      setAiTranscript(text)
      setAiQuery(text)
      stopAiListening() // Auto-stop after getting result
    }
    
    recognition.onend = () => {
      setAiListening(false)
      if (aiListeningTimeoutRef.current) {
        clearTimeout(aiListeningTimeoutRef.current)
        aiListeningTimeoutRef.current = null
      }
    }
    
    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error)
      setAiListening(false)
      if (aiListeningTimeoutRef.current) {
        clearTimeout(aiListeningTimeoutRef.current)
        aiListeningTimeoutRef.current = null
      }
    }
    
    recognition.onstart = () => {
      setAiListening(true)
      // Auto-stop after 30 seconds
      aiListeningTimeoutRef.current = setTimeout(() => {
        stopAiListening()
      }, 30000)
    }
    
    aiRecognitionRef.current = recognition
    recognition.start()
  }

  const stopAiListening = () => {
    if (aiRecognitionRef.current) {
      try {
        aiRecognitionRef.current.stop()
        aiRecognitionRef.current.abort()
      } catch (e) {
        console.log('Error stopping recognition:', e)
      }
      aiRecognitionRef.current = null
    }
    setAiListening(false)
    if (aiListeningTimeoutRef.current) {
      clearTimeout(aiListeningTimeoutRef.current)
      aiListeningTimeoutRef.current = null
    }
  }

  // Voice input logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.')
      return
    }
    
    // Stop any existing recognition first
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current.abort()
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setUserInput(userInput ? userInput + '\n' + text : text)
      stopListening() // Auto-stop after getting result
    }
    
    recognition.onend = () => {
      setIsListening(false)
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
        listeningTimeoutRef.current = null
      }
    }
    
    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error)
      setIsListening(false)
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
        listeningTimeoutRef.current = null
      }
    }
    
    recognition.onstart = () => {
      setIsListening(true)
      // Auto-stop after 30 seconds
      listeningTimeoutRef.current = setTimeout(() => {
        stopListening()
      }, 30000)
    }
    
    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current.abort()
      } catch (e) {
        console.log('Error stopping recognition:', e)
      }
      recognitionRef.current = null
    }
    setIsListening(false)
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current)
      listeningTimeoutRef.current = null
    }
  }

  // Custom voice modal functions
  const openVoiceModal = () => {
    setShowVoiceModal(true)
    setVoiceModalText('')
    setVoiceModalListening(false)
  }

  const closeVoiceModal = () => {
    setShowVoiceModal(false)
    if (voiceModalRecognitionRef.current) {
      voiceModalRecognitionRef.current.stop()
      voiceModalRecognitionRef.current.abort()
    }
    setVoiceModalListening(false)
  }

  const startVoiceModalListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.')
      return
    }
    
    if (voiceModalRecognitionRef.current) {
      voiceModalRecognitionRef.current.stop()
      voiceModalRecognitionRef.current.abort()
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      setVoiceModalText(transcript)
    }
    
    recognition.onend = () => {
      setVoiceModalListening(false)
      // Auto-focus the text area for editing after speaking
      setTimeout(() => {
        const textArea = document.getElementById('voice-modal-textarea')
        if (textArea) textArea.focus()
      }, 100)
    }
    
    recognition.onerror = (event) => {
      console.log('Voice modal error:', event.error)
      setVoiceModalListening(false)
    }
    
    recognition.onstart = () => {
      setVoiceModalListening(true)
      setVoiceModalText('') // Clear previous text when starting
    }
    
    voiceModalRecognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceModalListening = () => {
    if (voiceModalRecognitionRef.current) {
      voiceModalRecognitionRef.current.stop()
      voiceModalRecognitionRef.current.abort()
    }
    setVoiceModalListening(false)
  }

  const applyVoiceModalText = () => {
    if (voiceModalText.trim()) {
      setUserInput(userInput ? userInput + '\n' + voiceModalText : voiceModalText)
    }
    closeVoiceModal()
  }

  return (
    <div className="shopping-container">
      <h1>Shopping List</h1>
      <div style={{ marginBottom: 24, padding: 16, background: LIFETIME_COLORS.background, borderRadius: 16, boxShadow: '0 2px 12px #bfc1c2', border: `1px solid ${LIFETIME_COLORS.accent}` }}>
        <h2 style={{ marginBottom: 8, color: LIFETIME_COLORS.primary, fontWeight: 800 }}>Smart Shopping Assistant</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ask e.g. 'What should I buy this month?'"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${LIFETIME_COLORS.accent}`, fontSize: 18, background: LIFETIME_COLORS.white, color: LIFETIME_COLORS.black, boxShadow: '0 1px 4px #e6f4ea' }}
            onKeyDown={e => { if (e.key === 'Enter') handleAiQuery() }}
          />
          <button
            onClick={aiListening ? stopAiListening : startAiListening}
            style={{
              background: aiListening ? LIFETIME_COLORS.primary : LIFETIME_COLORS.accent,
              color: aiListening ? LIFETIME_COLORS.white : LIFETIME_COLORS.primary,
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: aiListening ? `0 0 8px 2px ${LIFETIME_COLORS.primary}` : 'none',
              animation: aiListening ? 'pulse 1s infinite' : 'none',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            title={aiListening ? 'Stop Listening' : 'Start Voice Input'}
          >
            {aiListening ? <Square size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={handleAiQuery} disabled={aiProcessing} style={{ padding: '12px 24px', borderRadius: 12, background: LIFETIME_COLORS.primary, color: LIFETIME_COLORS.white, border: 'none', fontWeight: 700, fontSize: 18, boxShadow: '0 1px 4px #bfc1c2' }}>
            {aiProcessing ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
        {aiListening && <span style={{ color: LIFETIME_COLORS.primary, fontWeight: 600, marginLeft: 8 }}>Listening...</span>}
        {aiTranscript && !aiListening && (
          <span style={{ color: LIFETIME_COLORS.primary, marginLeft: 8 }}>Heard: "{aiTranscript}"</span>
        )}
        {aiResponse && <div style={{ marginTop: 16, color: LIFETIME_COLORS.primary, background: LIFETIME_COLORS.highlight, padding: 14, borderRadius: 10, fontSize: 17, fontWeight: 500 }}>{aiResponse}</div>}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveList('main')} style={{ fontWeight: activeList === 'main' ? 'bold' : 'normal' }}>Main List</button>
        <button onClick={() => setActiveList('misc')} style={{ fontWeight: activeList === 'misc' ? 'bold' : 'normal' }}>Misc List</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h3>Shopping Analytics</h3>
        <div>Total items: {analytics.total || 0}</div>
        <div>Completed: {analytics.completed || 0}</div>
        <div>By Category: {Object.entries(analytics.byCategory || {}).map(([cat, n]) => `${cat}: ${n}`).join(', ')}</div>
        {reminder && <div style={{ color: 'orange', fontWeight: 600 }}>{reminder}</div>}
      </div>
      <div className="shopping-list-container">
        {Object.entries((activeList === 'main' ? mainList : miscList).reduce((acc, item) => {
          acc[item.category] = acc[item.category] || []
          acc[item.category].push(item)
          return acc
        }, {})).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {CATEGORY_ICONS[cat] || null}{cat}
        </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', borderRadius: 6, padding: 6, marginBottom: 2 }}>
                <span>{item.quantity}x {item.name}</span>
                {item.brand && <span>({item.brand})</span>}
                {item.grainger_part && (
                  <a href={item.grainger_url} target="_blank" rel="noopener noreferrer" title="View on Grainger">
                    <Store size={16} />
                  </a>
                )}
                {item.home_depot_aisle && (
                  <a href={`https://www.homedepot.com/s/search?q=${item.name}`} target="_blank" rel="noopener noreferrer" title="View on Home Depot">
                    <MapPin size={16} />
                  </a>
                )}
                {activeList === 'main' && (
                  <button onClick={() => moveToMisc(idx)} title="Move to Misc" style={{ marginLeft: 8 }}>
                    Move to Misc
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
        </div>

      <div className="input-section">
        <h2>Add Items</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder={`Add item to ${activeList} list (e.g., "10x LED bulbs")`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                processShoppingInput()
              }
            }}
          />
          <button
            onClick={openVoiceModal}
            style={{
              background: LIFETIME_COLORS.accent,
              color: LIFETIME_COLORS.primary,
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>
          <button onClick={processShoppingInput} disabled={processing}>
            {processing ? <Loader className="loader" /> : <Plus />}
          </button>
        </div>
      </div>
      {suggestedItems.length > 0 && (
        <div style={{ marginTop: 16, background: '#f6f6f6', padding: 12, borderRadius: 8 }}>
          <b>AI Suggestions:</b> {suggestedItems.join(', ')}
        </div>
      )}

      {message.text && (
        <div className={`message-box ${message.type}`}>
          {message.text}
        </div>
      )}
      {showVoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
                          display: 'flex', 
                          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
                        <div style={{ 
            background: LIFETIME_COLORS.white,
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            maxWidth: 500,
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ color: LIFETIME_COLORS.primary, marginBottom: 16 }}>Voice Input</h3>
            
            <div style={{ marginBottom: 16 }}>
                    <button
                onClick={voiceModalListening ? stopVoiceModalListening : startVoiceModalListening}
                          style={{
                  background: voiceModalListening ? LIFETIME_COLORS.primary : LIFETIME_COLORS.accent,
                  color: voiceModalListening ? LIFETIME_COLORS.white : LIFETIME_COLORS.primary,
                            border: 'none',
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: voiceModalListening ? `0 0 12px 4px ${LIFETIME_COLORS.primary}` : 'none',
                  animation: voiceModalListening ? 'pulse 1s infinite' : 'none',
                            cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {voiceModalListening ? <Square size={30} /> : <Mic size={30} />}
                        </button>
              <p style={{ marginTop: 8, color: LIFETIME_COLORS.primary, fontWeight: 600 }}>
                {voiceModalListening ? 'Listening... Click to stop' : 'Click to start speaking'}
              </p>
                          </div>
                          
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', textAlign: 'left', marginBottom: 8, color: LIFETIME_COLORS.primary, fontWeight: 600 }}>
                Edit your text:
              </label>
              <textarea
                id="voice-modal-textarea"
                value={voiceModalText}
                onChange={(e) => setVoiceModalText(e.target.value)}
                placeholder="Speak to add items to your shopping list..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 8,
                  border: `1.5px solid ${LIFETIME_COLORS.accent}`,
                  fontSize: 16,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  background: LIFETIME_COLORS.white,
                  color: LIFETIME_COLORS.black
                }}
              />
                            </div>
                            
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={closeVoiceModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: `1px solid ${LIFETIME_COLORS.accent}`,
                  background: LIFETIME_COLORS.white,
                  color: LIFETIME_COLORS.primary,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyVoiceModalText}
                disabled={!voiceModalText.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: LIFETIME_COLORS.primary,
                  color: LIFETIME_COLORS.white,
                  border: 'none',
                  cursor: voiceModalText.trim() ? 'pointer' : 'not-allowed',
                  opacity: voiceModalText.trim() ? 1 : 0.5,
                  fontWeight: 600
                }}
              >
                Add to List
              </button>
                          </div>
                        </div>
          </div>
        )}
    </div>
  )
}

export default Shopping 