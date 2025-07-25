import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Mic, 
  MicOff, 
  Loader, 
  Send, 
  HelpCircle, 
  Paperclip, 
  Image, 
  File, 
  Link, 
  Zap, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Brain, 
  Wifi, 
  WifiOff, 
  Camera, 
  Download, 
  Upload,
  Search,
  BookOpen,
  FileText,
  FileVideo,
  Play,
  Folder,
  Tag,
  Tool,
  Shield,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
  Star,
  History,
  TrendingUp,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react'

const EnhancedVoiceAssistant = () => {
  console.log('EnhancedVoiceAssistant rendering!')
  
  // Core state
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentContext, setCurrentContext] = useState('general')
  const [chatLogs, setChatLogs] = useState({
    general: [],
    tasks: [],
    shopping: [],
    knowledge: [],
    email: [],
    files: [],
    profile: [],
    calendar: []
  })
  const [inputText, setInputText] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineQueue, setOfflineQueue] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [knowledgeResults, setKnowledgeResults] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [favoriteResources, setFavoriteResources] = useState([])
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    language: 'en-US'
  })

  // Speech recognition setup
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(window.speechSynthesis)

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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = voiceSettings.language

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setInputText(finalTranscript)
          handleSend(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }
  }, [voiceSettings.language])

  // Load search history and favorites
  useEffect(() => {
    loadSearchHistory()
    loadFavoriteResources()
  }, [])

  const loadSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setSearchHistory(data || [])
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }

  const loadFavoriteResources = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFavoriteResources(data || [])
    } catch (error) {
      console.error('Error loading favorite resources:', error)
    }
  }

  // Enhanced knowledge search function
  const searchKnowledgeBase = async (query) => {
    try {
      console.log('🔍 Searching knowledge base for:', query)
      
      // Search in knowledge_files table
      const { data: files, error: filesError } = await supabase
        .from('knowledge_files')
        .select(`
          *,
          knowledge_categories(name, color, icon)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,equipment_type.ilike.%${query}%,tags.cs.{${query}}`)

      if (filesError) throw filesError

      // Search in knowledge table (Q&A)
      const { data: qa, error: qaError } = await supabase
        .from('knowledge')
        .select('*')
        .or(`question.ilike.%${query}%,response.ilike.%${query}%`)

      if (qaError) throw qaError

      // Combine and rank results
      const results = []
      
      // Add file results
      if (files) {
        files.forEach(file => {
          results.push({
            type: 'file',
            id: file.id,
            title: file.title,
            description: file.description,
            file_type: file.file_type,
            file_path: file.file_path,
            equipment_type: file.equipment_type,
            difficulty_level: file.difficulty_level,
            estimated_time: file.estimated_time,
            required_tools: file.required_tools,
            safety_notes: file.safety_notes,
            tags: file.tags,
            category: file.knowledge_categories?.name,
            relevance_score: calculateRelevanceScore(query, file)
          })
        })
      }

      // Add Q&A results
      if (qa) {
        qa.forEach(item => {
          results.push({
            type: 'qa',
            id: item.id,
            title: item.question,
            description: item.response,
            relevance_score: calculateRelevanceScore(query, item)
          })
        })
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevance_score - a.relevance_score)

      setKnowledgeResults(results)
      
      // Save search to history
      await saveSearchHistory(query, results.length)
      
      return results
    } catch (error) {
      console.error('Error searching knowledge base:', error)
      return []
    }
  }

  const calculateRelevanceScore = (query, item) => {
    const queryLower = query.toLowerCase()
    let score = 0

    // Title match (highest weight)
    if (item.title?.toLowerCase().includes(queryLower)) {
      score += 10
    }

    // Description match
    if (item.description?.toLowerCase().includes(queryLower)) {
      score += 5
    }

    // Equipment type match
    if (item.equipment_type?.toLowerCase().includes(queryLower)) {
      score += 8
    }

    // Tags match
    if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 6
    }

    // Category match
    if (item.category?.toLowerCase().includes(queryLower)) {
      score += 4
    }

    // Exact word matches
    const queryWords = queryLower.split(' ')
    queryWords.forEach(word => {
      if (item.title?.toLowerCase().includes(word)) score += 2
      if (item.description?.toLowerCase().includes(word)) score += 1
    })

    return score
  }

  const saveSearchHistory = async (query, resultCount) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          query,
          result_count: resultCount,
          user_id: 'current-user' // Replace with actual user ID
        })

      if (error) throw error
      
      // Update local state
      setSearchHistory(prev => [{
        id: Date.now(),
        query,
        result_count: resultCount,
        created_at: new Date().toISOString()
      }, ...prev.slice(0, 19)]) // Keep only 20 items
    } catch (error) {
      console.error('Error saving search history:', error)
    }
  }

  const toggleFavorite = async (resourceId, resourceType) => {
    try {
      const existing = favoriteResources.find(fav => 
        fav.resource_id === resourceId && fav.resource_type === resourceType
      )

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_resources')
          .delete()
          .eq('id', existing.id)

        if (error) throw error

        setFavoriteResources(prev => prev.filter(fav => fav.id !== existing.id))
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_resources')
          .insert({
            resource_id: resourceId,
            resource_type: resourceType,
            user_id: 'current-user' // Replace with actual user ID
          })

        if (error) throw error

        // Add to local state (you'd need to fetch the full resource details)
        setFavoriteResources(prev => [...prev, {
          id: Date.now(),
          resource_id: resourceId,
          resource_type: resourceType,
          created_at: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const playVideo = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (error) throw error

      setCurrentVideo({
        url: data.signedUrl,
        filePath
      })
    } catch (error) {
      console.error('Error loading video:', error)
      showError('Failed to load video')
    }
  }

  const downloadFile = async (filePath, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showSuccess('File downloaded successfully')
    } catch (error) {
      console.error('Error downloading file:', error)
      showError('Failed to download file')
    }
  }

  const speakResponse = (text) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceSettings.speed
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume
      utterance.lang = voiceSettings.language
      synthesisRef.current.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const showError = (message) => {
    console.error('Error:', message)
    // You can implement a toast notification here
  }

  const showSuccess = (message) => {
    console.log('Success:', message)
    // You can implement a toast notification here
  }

  // Enhanced command parsing
  const parseCommand = (text) => {
    const lowerText = text.toLowerCase()
    
    // Knowledge search patterns
    if (lowerText.includes('how to') || lowerText.includes('what is') || 
        lowerText.includes('show me') || lowerText.includes('find') ||
        lowerText.includes('search for') || lowerText.includes('look up')) {
      return {
        action: 'search_knowledge',
        query: text,
        parameters: { search_query: text }
      }
    }

    // Video playback patterns
    if (lowerText.includes('play') || lowerText.includes('show video') || 
        lowerText.includes('watch')) {
      return {
        action: 'play_video',
        query: text,
        parameters: { video_query: text }
      }
    }

    // File download patterns
    if (lowerText.includes('download') || lowerText.includes('get file') || 
        lowerText.includes('save')) {
      return {
        action: 'download_file',
        query: text,
        parameters: { file_query: text }
      }
    }

    // General patterns
    if (lowerText.includes('task') || lowerText.includes('add task')) {
      return {
        action: 'add_task',
        parameters: { task: text }
      }
    }

    if (lowerText.includes('shop') || lowerText.includes('buy') || lowerText.includes('purchase')) {
      return {
        action: 'add_shopping',
        parameters: { shopping_items: text }
      }
    }

    if (lowerText.includes('email') || lowerText.includes('send')) {
      return {
        action: 'send_email',
        parameters: { email_subject: text }
      }
    }

    // Default to knowledge search
    return {
      action: 'search_knowledge',
      query: text,
      parameters: { search_query: text }
    }
  }

  const handleSend = async (text) => {
    if (!text.trim()) return
    
    console.log('Sending message:', text)
    
    setChatLogs(logs => ({
      ...logs,
      [currentContext]: [...logs[currentContext], { role: 'user', text }]
    }))
    
    setIsProcessing(true)
    
    try {
      const command = parseCommand(text)
      
      if (!isOnline) {
        showError('You are offline. Please connect to the internet to use the assistant.')
        return
      }
      
      let response = ''
      
      switch (command.action) {
        case 'search_knowledge':
          const results = await searchKnowledgeBase(command.query)
          if (results.length > 0) {
            response = `🔍 Found ${results.length} relevant resources:\n\n`
            results.slice(0, 5).forEach((result, index) => {
              response += `${index + 1}. ${result.title}\n`
              if (result.description) {
                response += `   ${result.description.substring(0, 100)}...\n`
              }
              if (result.equipment_type) {
                response += `   Equipment: ${result.equipment_type}\n`
              }
              if (result.difficulty_level) {
                response += `   Difficulty: ${result.difficulty_level}\n`
              }
              response += '\n'
            })
            
            if (results.length > 5) {
              response += `... and ${results.length - 5} more results.`
            }
          } else {
            response = `❌ No results found for "${command.query}". Try rephrasing your question or check if the information exists in the knowledge base.`
          }
          break
          
        case 'play_video':
          const videoResults = await searchKnowledgeBase(command.query)
          const videoFiles = videoResults.filter(r => r.type === 'file' && r.file_type.startsWith('video/'))
          
          if (videoFiles.length > 0) {
            const video = videoFiles[0]
            await playVideo(video.file_path)
            response = `🎥 Playing video: ${video.title}`
          } else {
            response = `❌ No video found for "${command.query}"`
          }
          break
          
        case 'download_file':
          const fileResults = await searchKnowledgeBase(command.query)
          if (fileResults.length > 0) {
            const file = fileResults[0]
            await downloadFile(file.file_path, file.title)
            response = `📥 Downloaded: ${file.title}`
          } else {
            response = `❌ No file found for "${command.query}"`
          }
          break
          
        case 'add_task':
          response = `✅ Task added: ${command.parameters.task}`
          break
          
        case 'add_shopping':
          response = `🛒 Added to shopping: ${command.parameters.shopping_items}`
          break
          
        case 'send_email':
          response = `📧 Email composed: ${command.parameters.email_subject}`
          break
          
        default:
          response = `I understand you said: "${text}". How can I help you with that?`
      }
      
      // Add response to chat
      setChatLogs(logs => ({
        ...logs,
        [currentContext]: [...logs[currentContext], { role: 'assistant', text: response }]
      }))
      
      // Speak response if voice is enabled
      speakResponse(response)
      
    } catch (error) {
      console.error('Error processing message:', error)
      const errorResponse = 'Sorry, I encountered an error processing your request. Please try again.'
      setChatLogs(logs => ({
        ...logs,
        [currentContext]: [...logs[currentContext], { role: 'assistant', text: errorResponse }]
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
      setInputText('')
    }
  }

  return (
    <div className="enhanced-voice-assistant">
      {/* Header */}
      <div className="header">
        <h1>🎤 Smart Voice Assistant</h1>
        <p>Ask me anything about maintenance, procedures, or company resources</p>
        <div className="status-indicators">
          <div className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className={`status ${isListening ? 'listening' : 'idle'}`}>
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {isListening ? 'Listening' : 'Idle'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Chat Interface */}
        <div className="chat-section">
          <div className="chat-header">
            <h3>💬 Conversation</h3>
            <div className="chat-controls">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop' : 'Start'} Listening
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {chatLogs[currentContext].map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="message assistant">
                <div className="message-content">
                  <Loader className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleInputKey}
              placeholder="Type your question or command..."
              disabled={isProcessing}
            />
            <button
              onClick={() => {
                handleSend(inputText)
                setInputText('')
              }}
              disabled={!inputText.trim() || isProcessing}
              className="btn btn-primary"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Knowledge Results */}
        {knowledgeResults.length > 0 && (
          <div className="knowledge-results">
            <h3>📚 Search Results</h3>
            <div className="results-grid">
              {knowledgeResults.map((result, index) => (
                <div key={result.id} className="result-card">
                  <div className="result-header">
                    <div className="result-icon">
                      {result.type === 'file' && result.file_type.startsWith('video/') && <FileVideo className="w-6 h-6" />}
                      {result.type === 'file' && result.file_type.includes('pdf') && <FileText className="w-6 h-6" />}
                      {result.type === 'qa' && <MessageSquare className="w-6 h-6" />}
                    </div>
                    <div className="result-title">
                      <h4>{result.title}</h4>
                      {result.category && <span className="category">{result.category}</span>}
                    </div>
                    <div className="result-actions">
                      <button
                        onClick={() => toggleFavorite(result.id, result.type)}
                        className="btn btn-sm"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      {result.type === 'file' && result.file_type.startsWith('video/') && (
                        <button
                          onClick={() => playVideo(result.file_path)}
                          className="btn btn-sm btn-primary"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {result.type === 'file' && (
                        <button
                          onClick={() => downloadFile(result.file_path, result.title)}
                          className="btn btn-sm btn-secondary"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {result.description && (
                    <p className="result-description">{result.description}</p>
                  )}
                  
                  <div className="result-meta">
                    {result.equipment_type && (
                      <span className="meta-item">
                        <Tool className="w-3 h-3" />
                        {result.equipment_type}
                      </span>
                    )}
                    {result.difficulty_level && (
                      <span className={`meta-item difficulty ${result.difficulty_level}`}>
                        {result.difficulty_level}
                      </span>
                    )}
                    {result.estimated_time && (
                      <span className="meta-item">
                        <Clock className="w-3 h-3" />
                        {result.estimated_time}m
                      </span>
                    )}
                    {result.safety_notes && (
                      <span className="meta-item safety">
                        <Shield className="w-3 h-3" />
                        Safety Notes
                      </span>
                    )}
                  </div>
                  
                  {result.tags && result.tags.length > 0 && (
                    <div className="result-tags">
                      {result.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="search-history">
            <h3>📜 Recent Searches</h3>
            <div className="history-list">
              {searchHistory.slice(0, 5).map((search) => (
                <div key={search.id} className="history-item">
                  <span>{search.query}</span>
                  <span className="result-count">{search.result_count} results</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {currentVideo && (
          <div className="video-modal">
            <div className="video-modal-content">
              <div className="video-header">
                <h3>Video Player</h3>
                <button onClick={() => setCurrentVideo(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
              <video
                controls
                className="video-player"
                src={currentVideo.url}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-voice-assistant {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .header p {
          margin: 0 0 1rem 0;
          opacity: 0.9;
        }

        .status-indicators {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .status.online {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status.offline {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .status.listening {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          animation: pulse 2s infinite;
        }

        .status.idle {
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
        }

        .chat-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .chat-header h3 {
          margin: 0;
          color: #374151;
        }

        .chat-messages {
          height: 400px;
          overflow-y: auto;
          padding: 1rem;
        }

        .message {
          margin-bottom: 1rem;
          display: flex;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .message.user .message-content {
          background: #3b82f6;
          color: white;
        }

        .message.assistant .message-content {
          background: #f3f4f6;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-input {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .chat-input textarea {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          resize: none;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .chat-input textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .knowledge-results {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1rem;
        }

        .knowledge-results h3 {
          margin: 0 0 1rem 0;
          color: #374151;
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .result-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .result-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .result-header {
          display: flex;
          align-items: start;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .result-icon {
          color: #6b7280;
        }

        .result-title {
          flex: 1;
        }

        .result-title h4 {
          margin: 0 0 0.25rem 0;
          color: #374151;
          font-size: 1rem;
        }

        .category {
          font-size: 0.8rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .result-actions {
          display: flex;
          gap: 0.25rem;
        }

        .result-description {
          margin: 0 0 0.75rem 0;
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .result-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: #f3f4f6;
          color: #6b7280;
        }

        .meta-item.difficulty {
          font-weight: 500;
        }

        .meta-item.difficulty.beginner {
          background: #dcfce7;
          color: #166534;
        }

        .meta-item.difficulty.intermediate {
          background: #fef3c7;
          color: #92400e;
        }

        .meta-item.difficulty.advanced {
          background: #fee2e2;
          color: #991b1b;
        }

        .meta-item.safety {
          background: #fef3c7;
          color: #92400e;
        }

        .result-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
        }

        .search-history {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          margin-top: 1rem;
        }

        .search-history h3 {
          margin: 0 0 1rem 0;
          color: #374151;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-radius: 4px;
          background: #f9fafb;
          font-size: 0.9rem;
        }

        .result-count {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .video-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .video-modal-content {
          background: white;
          border-radius: 12px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .video-header h3 {
          margin: 0;
        }

        .video-player {
          width: 100%;
          max-height: 70vh;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .header h1 {
            font-size: 1.5rem;
          }
          
          .chat-messages {
            height: 300px;
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedVoiceAssistant