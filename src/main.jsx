import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

console.log("App starting...")

const App = () => {
  const [clickCount, setClickCount] = useState(0)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [conversation, setConversation] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('tasks') // 'tasks', 'shopping', 'maintenance', 'smart-assistant'
  const [newMessage, setNewMessage] = useState('')
  const [conversationSummary, setConversationSummary] = useState('')
  const [shoppingItems, setShoppingItems] = useState([])
  const [newShoppingItem, setNewShoppingItem] = useState('')
  const [maintenanceItems, setMaintenanceItems] = useState([])
  const [newMaintenanceItem, setNewMaintenanceItem] = useState('')
  const [theme, setTheme] = useState('light') // 'light' or 'dark'
  const [animations, setAnimations] = useState(true)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState('medium')
  const [appStats, setAppStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalShoppingItems: 0,
    completedShoppingItems: 0,
    totalMaintenanceItems: 0,
    completedMaintenanceItems: 0
  })
  const [appVersion, setAppVersion] = useState('1.0.0')
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString())

  // Initialize speech recognition on component mount
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const newRecognition = new SpeechRecognition()
      setRecognition(newRecognition)
      setSpeechSupported(true)
      console.log('Speech recognition initialized')
    } else {
      console.log('Speech recognition not supported')
      setSpeechSupported(false)
    }
  }, [])

  // Load tasks from localStorage on component mount
  useEffect(() => {
    console.log('Loading tasks from localStorage...')
    const savedTasks = localStorage.getItem('lifetime-maintenance-tasks')
    const savedConversation = localStorage.getItem('lifetime-maintenance-conversation')
    console.log('Saved tasks found:', savedTasks)
    console.log('Saved conversation found:', savedConversation)
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        console.log('Parsed tasks:', parsedTasks)
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Error loading tasks:', error)
        // Set default tasks if loading fails
        const defaultTasks = [
          { id: 1, text: 'Test task 1', completed: false },
          { id: 2, text: 'Test task 2', completed: true }
        ]
        setTasks(defaultTasks)
        localStorage.setItem('lifetime-maintenance-tasks', JSON.stringify(defaultTasks))
      }
    } else {
      console.log('No saved tasks found, setting defaults')
      // Set default tasks if no saved tasks exist
      const defaultTasks = [
        { id: 1, text: 'Test task 1', completed: false },
        { id: 2, text: 'Test task 2', completed: true }
      ]
      setTasks(defaultTasks)
      localStorage.setItem('lifetime-maintenance-tasks', JSON.stringify(defaultTasks))
    }

    // Load conversation history
    if (savedConversation) {
      try {
        const parsedConversation = JSON.parse(savedConversation)
        setConversation(parsedConversation)
        updateConversationSummary(parsedConversation)
      } catch (error) {
        console.error('Error loading conversation:', error)
      }
    }

    // Load shopping items
    const savedShoppingItems = localStorage.getItem('lifetime-maintenance-shopping')
    if (savedShoppingItems) {
      try {
        const parsedShoppingItems = JSON.parse(savedShoppingItems)
        setShoppingItems(parsedShoppingItems)
      } catch (error) {
        console.error('Error loading shopping items:', error)
      }
    }

    // Load maintenance items
    const savedMaintenanceItems = localStorage.getItem('lifetime-maintenance-maintenance')
    if (savedMaintenanceItems) {
      try {
        const parsedMaintenanceItems = JSON.parse(savedMaintenanceItems)
        setMaintenanceItems(parsedMaintenanceItems)
      } catch (error) {
        console.error('Error loading maintenance items:', error)
      }
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('lifetime-maintenance-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }

    setIsLoaded(true)
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving tasks to localStorage:', tasks)
      localStorage.setItem('lifetime-maintenance-tasks', JSON.stringify(tasks))
    }
  }, [tasks, isLoaded])

  // Save conversation to localStorage whenever conversation changes
  useEffect(() => {
    if (isLoaded && conversation.length > 0) {
      console.log('Saving conversation to localStorage:', conversation)
      localStorage.setItem('lifetime-maintenance-conversation', JSON.stringify(conversation))
      updateConversationSummary(conversation)
    }
  }, [conversation, isLoaded])

  // Save shopping items to localStorage whenever shopping items change
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving shopping items to localStorage:', shoppingItems)
      localStorage.setItem('lifetime-maintenance-shopping', JSON.stringify(shoppingItems))
    }
  }, [shoppingItems, isLoaded])

  // Save maintenance items to localStorage whenever maintenance items change
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving maintenance items to localStorage:', maintenanceItems)
      localStorage.setItem('lifetime-maintenance-maintenance', JSON.stringify(maintenanceItems))
    }
  }, [maintenanceItems, isLoaded])

  // Save theme preference to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lifetime-maintenance-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, isLoaded])

  // Update app statistics
  useEffect(() => {
    if (isLoaded) {
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.completed).length,
        totalShoppingItems: shoppingItems.length,
        completedShoppingItems: shoppingItems.filter(item => item.completed).length,
        totalMaintenanceItems: maintenanceItems.length,
        completedMaintenanceItems: maintenanceItems.filter(item => item.completed).length
      }
      setAppStats(stats)
    }
  }, [tasks, shoppingItems, maintenanceItems, isLoaded])

  const updateConversationSummary = (conv) => {
    if (conv.length === 0) {
      setConversationSummary('')
      return
    }

    // Create a summary of key topics discussed
    const topics = []
    const tasks = []
    
    conv.forEach(msg => {
      const content = msg.content.toLowerCase()
      
      // Extract topics
      if (content.includes('paver') || content.includes('paving')) topics.push('pavers')
      if (content.includes('weather')) topics.push('weather')
      if (content.includes('stock') || content.includes('market')) topics.push('stock market')
      if (content.includes('fix') || content.includes('repair')) topics.push('maintenance')
      if (content.includes('order') || content.includes('buy')) topics.push('ordering')
      
      // Extract potential tasks
      if (content.includes('need to') || content.includes('have to') || content.includes('should')) {
        const taskMatches = content.match(/(?:need to|have to|should)\s+([^.]+)/gi)
        if (taskMatches) {
          taskMatches.forEach(match => {
            const task = match.replace(/(?:need to|have to|should)\s+/i, '').trim()
            if (task.length > 5) tasks.push(task)
          })
        }
      }
    })

    const uniqueTopics = [...new Set(topics)]
    const uniqueTasks = [...new Set(tasks)]
    
    let summary = ''
    if (uniqueTopics.length > 0) {
      summary += `Topics discussed: ${uniqueTopics.join(', ')}. `
    }
    if (uniqueTasks.length > 0) {
      summary += `Tasks mentioned: ${uniqueTasks.slice(0, 3).join(', ')}${uniqueTasks.length > 3 ? '...' : ''}.`
    }
    
    setConversationSummary(summary)
  }

  const cleanTranscript = (text) => {
    if (!text) return ''
    
    // Remove common speech recognition artifacts
    let cleaned = text
    
    // Remove repeated words/phrases (like "OKOK", "so so", "need to need to")
    cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1')
    
    // Remove stuttering patterns (like "I I", "the the", "and and")
    cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1')
    
    // Remove filler words that get repeated
    cleaned = cleaned.replace(/\b(ok|so|um|uh|like|you know|i mean)\s+\1\b/gi, '$1')
    
    // Remove excessive punctuation
    cleaned = cleaned.replace(/\.{2,}/g, '.')
    cleaned = cleaned.replace(/!{2,}/g, '!')
    cleaned = cleaned.replace(/\?{2,}/g, '?')
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ')
    
    // Capitalize first letter of sentences
    cleaned = cleaned.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    
    return cleaned.trim()
  }

  const cleanCurrentTranscript = () => {
    setTranscript(prev => cleanTranscript(prev))
  }

  const handleClick = () => {
    setClickCount(prev => prev + 1)
  }

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        priority: selectedPriority,
        createdAt: new Date().toISOString(),
        category: 'general'
      }
      console.log('Adding new task:', newTaskObj)
      setTasks(prev => [...prev, newTaskObj])
      setNewTask('')
      setSelectedPriority('medium')
    }
  }

  const deleteTask = (id) => {
    console.log('Deleting task with id:', id)
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  const toggleTask = (id) => {
    console.log('Toggling task with id:', id)
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const clearAllTasks = () => {
    if (window.confirm('Are you sure you want to delete all tasks?')) {
      console.log('Clearing all tasks')
      setTasks([])
    }
  }

  const startListening = () => {
    if (!recognition) {
      console.log('Speech recognition not available')
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    try {
      setIsListening(true)
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log('Speech recognition started')
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        console.log('Speech recognized:', transcript)
        const cleanedTranscript = cleanTranscript(transcript)
        setTranscript(cleanedTranscript)
        if (currentTab === 'tasks') {
          setNewTask(cleanedTranscript)
        } else if (currentTab === 'smart-assistant') {
          setNewMessage(cleanedTranscript)
        } else if (currentTab === 'shopping') {
          setNewShoppingItem(cleanedTranscript)
        } else if (currentTab === 'maintenance') {
          setNewMaintenanceItem(cleanedTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
      }

      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setIsListening(false)
      alert('Error starting speech recognition. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    if (currentTab === 'tasks') {
      setNewTask('')
    } else if (currentTab === 'smart-assistant') {
      setNewMessage('')
    } else if (currentTab === 'shopping') {
      setNewShoppingItem('')
    } else if (currentTab === 'maintenance') {
      setNewMaintenanceItem('')
    }
  }

  const sendMessage = async (message) => {
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message, timestamp: new Date() }
    setConversation(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Simulate AI response (replace with actual AI API call)
      const aiResponse = await simulateAIResponse(message)
      const assistantMessage = { role: 'assistant', content: aiResponse, timestamp: new Date() }
      setConversation(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const lowerMessage = message.toLowerCase()
    
    // Get conversation context for better responses
    const conversationContext = conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    const hasContext = conversation.length > 0
    
    // Weather responses
    if (lowerMessage.includes('weather')) {
      return "I'd be happy to help with weather information! However, I'm currently in demo mode and don't have access to real-time weather data. In a full implementation, I would connect to a weather API to provide current conditions, forecasts, and detailed weather information for your location."
    }
    
    // Stock price responses
    if (lowerMessage.includes('stock') || lowerMessage.includes('price') || lowerMessage.includes('market')) {
      return "I can help with stock market information! In demo mode, I can't access real-time stock prices, but in a full implementation I would connect to financial APIs to provide current stock prices, market trends, and investment insights."
    }
    
    // Task-related responses with context awareness
    if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('remind') || lowerMessage.includes('need to') || lowerMessage.includes('have to')) {
      if (hasContext) {
        return "I can help you manage tasks! I remember our conversation and can reference the tasks you mentioned earlier. I can create tasks from your voice or text input, organize them, and help you stay on top of your maintenance work. Just tell me what you need to do!"
      } else {
        return "I can help you manage tasks! I can create tasks from your voice or text input, organize them, and help you stay on top of your maintenance work. Just tell me what you need to do!"
      }
    }
    
    // Pavers and materials questions
    if (lowerMessage.includes('paver') || lowerMessage.includes('paving')) {
      if (hasContext && conversationContext.includes('paver')) {
        return "Based on our conversation about the pavers outside, I can help you choose the right type! For outdoor pavers, I'd recommend concrete pavers for durability and weather resistance. Consider factors like color, size, and pattern to match your existing setup. Would you like me to help you calculate how many you need based on the area you mentioned?"
      } else {
        return "I can help you with paver selection! For outdoor applications, I'd recommend concrete pavers for durability and weather resistance. What type of project are you working on?"
      }
    }
    
    // Context-aware responses for maintenance work
    if (lowerMessage.includes('fix') || lowerMessage.includes('repair') || lowerMessage.includes('maintenance')) {
      if (hasContext) {
        return "I understand you're working on maintenance tasks. I remember our earlier conversation and can help you prioritize and organize your work. What specific maintenance task would you like to discuss or add to your list?"
      } else {
        return "I can help you with maintenance tasks! I can create task lists, provide guidance, and help you stay organized. What maintenance work do you need to do?"
      }
    }
    
    // Ordering and purchasing context
    if (lowerMessage.includes('order') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
      if (hasContext && conversationContext.includes('paver')) {
        return "I see you need to order more pavers for the outside project we discussed. I can help you determine the quantity needed and recommend suppliers. Do you have the measurements for the area you need to cover?"
      } else {
        return "I can help you with ordering materials and supplies for your maintenance work. What do you need to order?"
      }
    }
    
    // General conversation with context awareness
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      if (hasContext) {
        return "Hello! I remember our conversation from earlier. I'm here to help you continue with your maintenance work and answer any questions you have. What would you like to work on next?"
      } else {
        return "Hello! I'm your AI assistant for the Lifetime Maintenance app. I can help you with tasks, answer questions, provide information, and assist with your maintenance work. What can I help you with today?"
      }
    }
    
    // Context-aware general responses
    if (hasContext) {
      return "I understand your question and I remember our conversation context. I'm here to help you with your maintenance work and can reference what we've discussed earlier. How can I assist you further?"
    } else {
      return "That's an interesting question! I'm your AI assistant and I'm here to help with your maintenance work, answer questions, and assist with various tasks. In a full implementation, I would have access to real-time data and more advanced capabilities. How can I help you today?"
    }
  }

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation history?')) {
      console.log('Clearing conversation')
      setConversation([])
      setConversationSummary('')
      localStorage.removeItem('lifetime-maintenance-conversation')
    }
  }

  const addShoppingItem = () => {
    if (newShoppingItem.trim()) {
      const newItem = {
        id: Date.now(),
        text: newShoppingItem.trim(),
        completed: false,
        priority: 'medium'
      }
      console.log('Adding new shopping item:', newItem)
      setShoppingItems(prev => [...prev, newItem])
      setNewShoppingItem('')
    }
  }

  const deleteShoppingItem = (id) => {
    console.log('Deleting shopping item with id:', id)
    setShoppingItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleShoppingItem = (id) => {
    console.log('Toggling shopping item with id:', id)
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const clearAllShoppingItems = () => {
    if (window.confirm('Are you sure you want to delete all shopping items?')) {
      console.log('Clearing all shopping items')
      setShoppingItems([])
    }
  }

  const addMaintenanceItem = () => {
    if (newMaintenanceItem.trim()) {
      const newItem = {
        id: Date.now(),
        text: newMaintenanceItem.trim(),
        completed: false,
        priority: 'medium',
        dueDate: null,
        category: 'general'
      }
      console.log('Adding new maintenance item:', newItem)
      setMaintenanceItems(prev => [...prev, newItem])
      setNewMaintenanceItem('')
    }
  }

  const deleteMaintenanceItem = (id) => {
    console.log('Deleting maintenance item with id:', id)
    setMaintenanceItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleMaintenanceItem = (id) => {
    console.log('Toggling maintenance item with id:', id)
    setMaintenanceItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const clearAllMaintenanceItems = () => {
    if (window.confirm('Are you sure you want to delete all maintenance items?')) {
      console.log('Clearing all maintenance items')
      setMaintenanceItems([])
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const toggleAnimations = () => {
    setAnimations(prev => !prev)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e53e3e'
      case 'medium': return '#d69e2e'
      case 'low': return '#38a169'
      default: return '#d69e2e'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '🟡'
    }
  }

  const getDaysSinceCreation = (createdAt) => {
    if (!createdAt) return 0
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const exportData = () => {
    const exportData = {
      version: appVersion,
      lastUpdated: new Date().toISOString(),
      tasks: tasks,
      shoppingItems: shoppingItems,
      maintenanceItems: maintenanceItems,
      conversation: conversation,
      theme: theme,
      animations: animations
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lifetime-maintenance-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.tasks) setTasks(data.tasks)
          if (data.shoppingItems) setShoppingItems(data.shoppingItems)
          if (data.maintenanceItems) setMaintenanceItems(data.maintenanceItems)
          if (data.conversation) setConversation(data.conversation)
          if (data.theme) setTheme(data.theme)
          if (data.animations !== undefined) setAnimations(data.animations)
          alert('Data imported successfully!')
        } catch (error) {
          console.error('Error importing data:', error)
          alert('Error importing data. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
  }

  // Theme-based styles
  const themeStyles = {
    light: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBg: 'white',
      textColor: '#2d3748',
      borderColor: '#e2e8f0',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      buttonBg: '#1a3d2f',
      buttonHover: '#2d5a3d'
    },
    dark: {
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      cardBg: '#2d3748',
      textColor: '#f7fafc',
      borderColor: '#4a5568',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      buttonBg: '#4a5568',
      buttonHover: '#718096'
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: currentTheme.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transition: animations ? 'all 0.3s ease' : 'none'
    }}>
      <h1 style={{ color: currentTheme.textColor, marginBottom: '1rem' }}>
        🎯 Lifetime Maintenance App
      </h1>
      <p style={{ fontSize: '1.2rem', color: currentTheme.textColor }}>
        React is working! ✅
      </p>
      <p style={{ fontSize: '1rem', color: currentTheme.textColor, marginTop: '1rem' }}>
        Step 14: Production-ready deployment
      </p>
      
      {/* Theme Controls */}
      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        gap: '10px',
        alignItems: 'center'
      }}>
        <button 
          onClick={toggleTheme}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            backgroundColor: currentTheme.buttonBg,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: animations ? 'all 0.2s' : 'none'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = currentTheme.buttonHover}
          onMouseOut={(e) => e.target.style.backgroundColor = currentTheme.buttonBg}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <button 
          onClick={toggleAnimations}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            backgroundColor: currentTheme.buttonBg,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: animations ? 'all 0.2s' : 'none'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = currentTheme.buttonHover}
          onMouseOut={(e) => e.target.style.backgroundColor = currentTheme.buttonBg}
        >
                  {animations ? '🎬 Disable Animations' : '🎬 Enable Animations'}
      </button>
    </div>

    {/* Data Management */}
    <div style={{ 
      marginTop: '1rem', 
      display: 'flex', 
      gap: '10px',
      alignItems: 'center'
    }}>
      <button 
        onClick={exportData}
        style={{
          padding: '8px 16px',
          fontSize: '0.9rem',
          backgroundColor: currentTheme.buttonBg,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: animations ? 'all 0.2s' : 'none'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = currentTheme.buttonHover}
        onMouseOut={(e) => e.target.style.backgroundColor = currentTheme.buttonBg}
      >
        📤 Export Data
      </button>
      <label style={{
        padding: '8px 16px',
        fontSize: '0.9rem',
        backgroundColor: currentTheme.buttonBg,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: animations ? 'all 0.2s' : 'none',
        display: 'inline-block'
      }}>
        📥 Import Data
        <input
          type="file"
          accept=".json"
          onChange={importData}
          style={{ display: 'none' }}
        />
      </label>
    </div>

    {/* App Statistics Dashboard */}
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      background: currentTheme.cardBg,
      borderRadius: '8px',
      boxShadow: currentTheme.shadow,
      border: `1px solid ${currentTheme.borderColor}`,
      maxWidth: '400px',
      width: '100%'
    }}>
      <h3 style={{ 
        color: currentTheme.textColor, 
        marginBottom: '1rem', 
        textAlign: 'center',
        fontSize: '1.1rem'
      }}>
        📊 App Statistics
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: currentTheme.textColor, fontWeight: 'bold' }}>
            {appStats.totalTasks}
          </div>
          <div style={{ fontSize: '0.8rem', color: currentTheme.textColor }}>
            Total Tasks
          </div>
          <div style={{ fontSize: '0.7rem', color: currentTheme.textColor }}>
            {appStats.completedTasks} completed
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: currentTheme.textColor, fontWeight: 'bold' }}>
            {appStats.totalShoppingItems}
          </div>
          <div style={{ fontSize: '0.8rem', color: currentTheme.textColor }}>
            Shopping Items
          </div>
          <div style={{ fontSize: '0.7rem', color: currentTheme.textColor }}>
            {appStats.completedShoppingItems} completed
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: currentTheme.textColor, fontWeight: 'bold' }}>
            {appStats.totalMaintenanceItems}
          </div>
          <div style={{ fontSize: '0.8rem', color: currentTheme.textColor }}>
            Maintenance Tasks
          </div>
          <div style={{ fontSize: '0.7rem', color: currentTheme.textColor }}>
            {appStats.completedMaintenanceItems} completed
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: currentTheme.textColor, fontWeight: 'bold' }}>
            {conversation.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: currentTheme.textColor }}>
            AI Conversations
          </div>
          <div style={{ fontSize: '0.7rem', color: currentTheme.textColor }}>
            {conversationSummary ? 'Has context' : 'No context'}
          </div>
        </div>
      </div>
    </div>

      <button 
        onClick={handleClick}
        style={{
          marginTop: '2rem',
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: currentTheme.buttonBg,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: animations ? 'all 0.2s' : 'none',
          transform: animations ? 'scale(1)' : 'scale(1)',
          boxShadow: currentTheme.shadow
        }}
        onMouseOver={(e) => {
          if (animations) {
            e.target.style.backgroundColor = currentTheme.buttonHover
            e.target.style.transform = 'scale(1.05)'
          }
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = currentTheme.buttonBg
          e.target.style.transform = animations ? 'scale(1)' : 'scale(1)'
        }}
      >
        Click me! ({clickCount} clicks)
      </button>

      {/* Tab Navigation */}
      <div style={{ 
        marginTop: '2rem', 
        display: 'flex', 
        gap: '2px',
        background: '#e2e8f0',
        borderRadius: '8px',
        padding: '4px'
      }}>
        <button
          onClick={() => setCurrentTab('tasks')}
          style={{
            padding: '12px 20px',
            backgroundColor: currentTab === 'tasks' ? '#1a3d2f' : 'transparent',
            color: currentTab === 'tasks' ? 'white' : '#4a5568',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: currentTab === 'tasks' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          📋 Tasks
        </button>
        <button
          onClick={() => setCurrentTab('shopping')}
          style={{
            padding: '12px 20px',
            backgroundColor: currentTab === 'shopping' ? '#1a3d2f' : 'transparent',
            color: currentTab === 'shopping' ? 'white' : '#4a5568',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: currentTab === 'shopping' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          🛒 Shopping
        </button>
        <button
          onClick={() => setCurrentTab('maintenance')}
          style={{
            padding: '12px 20px',
            backgroundColor: currentTab === 'maintenance' ? '#1a3d2f' : 'transparent',
            color: currentTab === 'maintenance' ? 'white' : '#4a5568',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: currentTab === 'maintenance' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          🔧 Maintenance
        </button>
        <button
          onClick={() => setCurrentTab('smart-assistant')}
          style={{
            padding: '12px 20px',
            backgroundColor: currentTab === 'smart-assistant' ? '#1a3d2f' : 'transparent',
            color: currentTab === 'smart-assistant' ? 'white' : '#4a5568',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: currentTab === 'smart-assistant' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          🤖 AI Assistant
        </button>
      </div>

      {/* Tasks Tab */}
      {currentTab === 'tasks' && (
        <div style={{
          marginTop: '3rem',
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1a3d2f', margin: 0 }}>
              📋 Task List ({tasks.length} tasks)
            </h2>
            {tasks.length > 0 && (
              <button
                onClick={clearAllTasks}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* Add Task */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              onClick={addTask}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1a3d2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>

          {/* Voice Input */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported}
              style={{
                padding: '12px 24px',
                backgroundColor: !speechSupported ? '#cbd5e0' : isListening ? '#e53e3e' : '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: speechSupported ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                opacity: speechSupported ? 1 : 0.6
              }}
              title={!speechSupported ? 'Speech recognition not supported in this browser' : isListening ? 'Click to stop listening' : 'Click to start voice input'}
            >
              {!speechSupported ? '🎤 Voice (Not Supported)' : isListening ? '🔴 Listening...' : '🎤 Start Voice Input'}
            </button>
            {!speechSupported && (
              <div style={{ fontSize: '0.8rem', color: '#e53e3e', marginTop: '8px' }}>
                ⚠️ Voice input requires Chrome, Edge, or Safari browser
              </div>
            )}
            {transcript && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#4a5568' }}>Voice Input (Edit if needed):</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={cleanCurrentTranscript}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      title="Clean up repeated words and speech artifacts"
                    >
                      🧹 Clean
                    </button>
                    <button
                      onClick={clearTranscript}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your voice input will appear here..."
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>

          {/* Task Items */}
          <div style={{ textAlign: 'left' }}>
            {tasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
                No tasks yet. Add your first task above!
              </p>
            ) : (
              tasks.map(task => (
                <div key={task.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: task.completed ? '#f7fafc' : 'white'
                }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ marginRight: '12px' }}
                  />
                  <span style={{
                    flex: 1,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#718096' : '#2d3748'
                  }}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Shopping Tab */}
      {currentTab === 'shopping' && (
        <div style={{
          marginTop: '3rem',
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1a3d2f', margin: 0 }}>
              🛒 Shopping List ({shoppingItems.length} items)
            </h2>
            {shoppingItems.length > 0 && (
              <button
                onClick={clearAllShoppingItems}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* Add Shopping Item */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            <input
              type="text"
              value={newShoppingItem}
              onChange={(e) => setNewShoppingItem(e.target.value)}
              placeholder="Add a shopping item..."
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
            />
            <button
              onClick={addShoppingItem}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1a3d2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>

          {/* Voice Input for Shopping */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported}
              style={{
                padding: '12px 24px',
                backgroundColor: !speechSupported ? '#cbd5e0' : isListening ? '#e53e3e' : '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: speechSupported ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                opacity: speechSupported ? 1 : 0.6
              }}
              title={!speechSupported ? 'Speech recognition not supported in this browser' : isListening ? 'Click to stop listening' : 'Click to start voice input'}
            >
              {!speechSupported ? '🎤 Voice (Not Supported)' : isListening ? '🔴 Listening...' : '🎤 Start Voice Input'}
            </button>
            {!speechSupported && (
              <div style={{ fontSize: '0.8rem', color: '#e53e3e', marginTop: '8px' }}>
                ⚠️ Voice input requires Chrome, Edge, or Safari browser
              </div>
            )}
            {transcript && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#4a5568' }}>Voice Input (Edit if needed):</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={cleanCurrentTranscript}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      title="Clean up repeated words and speech artifacts"
                    >
                      🧹 Clean
                    </button>
                    <button
                      onClick={clearTranscript}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your voice input will appear here..."
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>

          {/* Shopping Items */}
          <div style={{ textAlign: 'left' }}>
            {shoppingItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
                No shopping items yet. Add your first item above!
              </p>
            ) : (
              shoppingItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: item.completed ? '#f7fafc' : 'white'
                }}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleShoppingItem(item.id)}
                    style={{ marginRight: '12px' }}
                  />
                  <span style={{
                    flex: 1,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#718096' : '#2d3748'
                  }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteShoppingItem(item.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {currentTab === 'maintenance' && (
        <div style={{
          marginTop: '3rem',
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1a3d2f', margin: 0 }}>
              🔧 Maintenance Tracker ({maintenanceItems.length} items)
            </h2>
            {maintenanceItems.length > 0 && (
              <button
                onClick={clearAllMaintenanceItems}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* Add Maintenance Item */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            <input
              type="text"
              value={newMaintenanceItem}
              onChange={(e) => setNewMaintenanceItem(e.target.value)}
              placeholder="Add a maintenance task..."
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addMaintenanceItem()}
            />
            <button
              onClick={addMaintenanceItem}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1a3d2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>

          {/* Voice Input for Maintenance */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported}
              style={{
                padding: '12px 24px',
                backgroundColor: !speechSupported ? '#cbd5e0' : isListening ? '#e53e3e' : '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: speechSupported ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                opacity: speechSupported ? 1 : 0.6
              }}
              title={!speechSupported ? 'Speech recognition not supported in this browser' : isListening ? 'Click to stop listening' : 'Click to start voice input'}
            >
              {!speechSupported ? '🎤 Voice (Not Supported)' : isListening ? '🔴 Listening...' : '🎤 Start Voice Input'}
            </button>
            {!speechSupported && (
              <div style={{ fontSize: '0.8rem', color: '#e53e3e', marginTop: '8px' }}>
                ⚠️ Voice input requires Chrome, Edge, or Safari browser
              </div>
            )}
            {transcript && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#4a5568' }}>Voice Input (Edit if needed):</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={cleanCurrentTranscript}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      title="Clean up repeated words and speech artifacts"
                    >
                      🧹 Clean
                    </button>
                    <button
                      onClick={clearTranscript}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your voice input will appear here..."
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>

          {/* Maintenance Items */}
          <div style={{ textAlign: 'left' }}>
            {maintenanceItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
                No maintenance tasks yet. Add your first task above!
              </p>
            ) : (
              maintenanceItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: item.completed ? '#f7fafc' : 'white'
                }}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleMaintenanceItem(item.id)}
                    style={{ marginRight: '12px' }}
                  />
                  <span style={{
                    flex: 1,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#718096' : '#2d3748'
                  }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteMaintenanceItem(item.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Tab */}
      {currentTab === 'smart-assistant' && (
        <div style={{
          marginTop: '3rem',
          width: '100%',
          maxWidth: '600px',
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          height: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1a3d2f', margin: 0 }}>
              🤖 AI Assistant
            </h2>
            {conversation.length > 0 && (
              <button
                onClick={clearConversation}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Conversation Summary */}
          {conversationSummary && (
            <div style={{
              padding: '8px 12px',
              background: '#f0fff4',
              borderRadius: '6px',
              marginBottom: '1rem',
              borderLeft: '4px solid #48bb78',
              fontSize: '0.9rem',
              color: '#2f855a'
            }}>
              <strong>📝 Conversation Context:</strong> {conversationSummary}
            </div>
          )}
          
          {/* Chat Messages */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            marginBottom: '1rem',
            textAlign: 'left',
            padding: '1rem',
            background: '#f7fafc',
            borderRadius: '8px'
          }}>
            {conversation.length === 0 ? (
              <p style={{ color: '#718096', fontStyle: 'italic' }}>
                Start a conversation! Ask me about weather, stocks, tasks, or anything else. I'll remember our conversation context like ChatGPT.
              </p>
            ) : (
              conversation.map((msg, index) => (
                <div key={index} style={{
                  marginBottom: '1rem',
                  padding: '8px 12px',
                  background: msg.role === 'user' ? '#e6fffa' : '#f0fff4',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${msg.role === 'user' ? '#38b2ac' : '#48bb78'}`
                }}>
                  <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                  <p style={{ margin: '4px 0 0 0' }}>{msg.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div style={{ textAlign: 'center', color: '#718096' }}>
                AI is thinking...
              </div>
            )}
          </div>

          {/* Voice Input for Chat */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported}
              style={{
                padding: '10px 20px',
                backgroundColor: !speechSupported ? '#cbd5e0' : isListening ? '#e53e3e' : '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: speechSupported ? 'pointer' : 'not-allowed',
                opacity: speechSupported ? 1 : 0.6
              }}
              title={!speechSupported ? 'Speech recognition not supported in this browser' : isListening ? 'Click to stop listening' : 'Click to start voice input'}
            >
              {!speechSupported ? '🎤 Voice (Not Supported)' : isListening ? '🔴 Listening...' : '🎤 Voice'}
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)}
            />
            <button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: newMessage.trim() && !isLoading ? '#1a3d2f' : '#cbd5e0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: newMessage.trim() && !isLoading ? 'pointer' : 'not-allowed'
              }}
            >
              Send
            </button>
          </div>

          {/* Voice Transcript - Editable */}
          {transcript && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#4a5568' }}>Voice Input (Edit if needed):</strong>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={cleanCurrentTranscript}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#3182ce',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    title="Clean up repeated words and speech artifacts"
                  >
                    🧹 Clean
                  </button>
                  <button
                    onClick={clearTranscript}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your voice input will appear here..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontFamily: 'Arial, sans-serif',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    sendMessage(transcript)
                    setTranscript('')
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1a3d2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Send Voice Message
                </button>
                <button
                  onClick={() => setNewMessage(transcript)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3182ce',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Copy to Text Box
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 