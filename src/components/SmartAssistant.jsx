import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const SmartAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState(null)
  const [conversation, setConversation] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState('chat') // 'chat' or 'tasks'
  const [conversationSummary, setConversationSummary] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isActivelyListening, setIsActivelyListening] = useState(false)

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

  // Load conversation history
  useEffect(() => {
    const savedConversation = localStorage.getItem('lifetime-maintenance-conversation')
    if (savedConversation) {
      try {
        const parsedConversation = JSON.parse(savedConversation)
        setConversation(parsedConversation)
        updateConversationSummary(parsedConversation)
      } catch (error) {
        console.error('Error loading conversation:', error)
      }
    }
  }, [])

  // Save conversation to localStorage whenever conversation changes
  useEffect(() => {
    if (conversation.length > 0) {
      console.log('Saving conversation to localStorage:', conversation)
      localStorage.setItem('lifetime-maintenance-conversation', JSON.stringify(conversation))
      updateConversationSummary(conversation)
    }
  }, [conversation])

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

  const startListening = () => {
    if (!recognition) {
      console.log('Speech recognition not available')
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    try {
      setIsListening(true)
      // Don't clear transcript when starting - keep existing text
      recognition.continuous = true // Make it continuous
      recognition.interimResults = true // Show interim results
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      // Set longer timeouts for thinking pauses
      recognition.maxAlternatives = 3 // Allow multiple alternatives
      
      // Custom timeout handling for thinking pauses
      let thinkingTimeout = null
      let lastSpeechTime = Date.now()
      let lastFinalTranscript = ''

      recognition.onstart = () => {
        console.log('Speech recognition started')
        setIsActivelyListening(true)
        lastSpeechTime = Date.now()
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ' // Add space between final results
          } else {
            interimTranscript += transcript
          }
        }

        // Clean up the transcripts
        const cleanedFinal = cleanTranscript(finalTranscript)
        const cleanedInterim = cleanTranscript(interimTranscript)

        // Update transcript with cleaned results
        setTranscript(prev => {
          const currentText = prev || ''
          let newText = currentText
          
          // Only add new final text if it's different from last time
          if (cleanedFinal && cleanedFinal !== lastFinalTranscript) {
            newText += cleanedFinal + ' '
            lastFinalTranscript = cleanedFinal
          }
          
          // Add interim text (will be cleaned up when it becomes final)
          if (cleanedInterim) {
            newText += cleanedInterim
          }
          
          console.log('Updated transcript:', newText)
          return newText
        })
        
        // Show we're actively listening
        setIsActivelyListening(true)
        lastSpeechTime = Date.now()

        // Clear any existing thinking timeout
        if (thinkingTimeout) {
          clearTimeout(thinkingTimeout)
        }

        // Set a new thinking timeout (30 seconds for thinking)
        thinkingTimeout = setTimeout(() => {
          if (isListening) {
            console.log('Thinking pause detected - keeping recognition active')
            setIsActivelyListening(false) // Show we're waiting but still listening
          }
        }, 30000) // 30 seconds for thinking
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        
        // Handle different error types intelligently
        switch (event.error) {
          case 'no-speech':
            console.log('No speech detected - waiting for you to think or speak...')
            // Don't stop - just wait
            return
            
          case 'audio-capture':
            console.log('Audio capture issue - trying to continue...')
            // Try to restart after a short delay
            setTimeout(() => {
              if (isListening) {
                recognition.start()
              }
            }, 1000)
            return
            
          case 'network':
            console.log('Network issue - continuing to listen...')
            // Network issues are temporary
            return
            
          case 'not-allowed':
            alert('Please allow microphone access to use voice input.')
            setIsListening(false)
            setIsActivelyListening(false)
            break
            
          case 'aborted':
            console.log('Recognition aborted - restarting...')
            // Restart after a short delay
            setTimeout(() => {
              if (isListening) {
                recognition.start()
              }
            }, 500)
            return
            
          default:
            console.log('Other error - continuing to listen...')
            return
        }
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        
        // Check if we should restart (user didn't manually stop)
        if (isListening) {
          const timeSinceLastSpeech = Date.now() - lastSpeechTime
          
          // If it's been less than 2 minutes since last speech, restart
          if (timeSinceLastSpeech < 120000) { // 2 minutes
            console.log('Restarting speech recognition after thinking pause...')
            setTimeout(() => {
              if (isListening) {
                recognition.start()
              }
            }, 100)
          } else {
            console.log('Long pause detected - keeping recognition ready')
            // Keep it ready but show we're waiting
            setIsActivelyListening(false)
          }
        } else {
          setIsListening(false)
          setIsActivelyListening(false)
        }
      }

      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setIsListening(false)
      setIsActivelyListening(false)
      alert('Error starting speech recognition. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
      setIsActivelyListening(false)
      // Don't clear transcript - keep it for editing
    }
  }

  const clearTranscript = () => {
    setTranscript('')
  }

  const cleanCurrentTranscript = () => {
    setTranscript(prev => cleanTranscript(prev))
  }

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation history?')) {
      console.log('Clearing conversation')
      setConversation([])
      setConversationSummary('')
      localStorage.removeItem('lifetime-maintenance-conversation')
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

  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="smart-assistant">
      <div className="assistant-header">
        <h2>🤖 Smart Assistant</h2>
        <p>Your AI-powered maintenance assistant with enhanced voice capabilities</p>
      </div>

      <div className="assistant-container">
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-button ${currentMode === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentMode('chat')}
          >
            🤖 AI Chat
          </button>
          <button
            className={`mode-button ${currentMode === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentMode('tasks')}
          >
            📋 Tasks
          </button>
        </div>

        {/* AI Chat Mode */}
        {currentMode === 'chat' && (
          <div className="chat-container">
            <div className="chat-header">
              <h3>AI Assistant</h3>
              {conversation.length > 0 && (
                <button
                  className="clear-button"
                  onClick={clearConversation}
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Conversation Summary */}
            {conversationSummary && (
              <div className="conversation-summary">
                <strong>📝 Conversation Context:</strong> {conversationSummary}
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="chat-messages">
              {conversation.length === 0 ? (
                <p className="empty-message">
                  Start a conversation! Ask me about weather, stocks, tasks, or anything else. I'll remember our conversation context like ChatGPT.
                </p>
              ) : (
                conversation.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                    <p>{msg.content}</p>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="loading-message">
                  AI is thinking...
                </div>
              )}
            </div>

            {/* Voice Input for Chat */}
            <div className="voice-input-section">
              <button
                className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported}
                title={!speechSupported ? 'Speech recognition not supported in this browser' : isListening ? 'Click to stop listening' : 'Click to start voice input'}
              >
                {!speechSupported ? '🎤 Voice (Not Supported)' : isListening ? (isActivelyListening ? '🔴 Listening...' : '⏸️ Waiting...') : '🎤 Voice'}
              </button>
              
              {!speechSupported && (
                <div className="warning-message">
                  ⚠️ Use Chrome/Edge/Safari for voice
                </div>
              )}
              
              {isActivelyListening && (
                <div className="status-message success">
                  🎯 Actively listening - speak naturally!
                </div>
              )}
              
              {isListening && !isActivelyListening && (
                <div className="status-message waiting">
                  🤔 Waiting for you to think or speak...
                </div>
              )}

              <div className="text-input-section">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)}
                />
                <button
                  className="send-button"
                  onClick={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim() || isLoading}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Voice Transcript - Editable */}
            {transcript && (
              <div className="transcript-section">
                <div className="transcript-header">
                  <strong>Voice Input (Edit if needed):</strong>
                  <div className="transcript-controls">
                    <button
                      className="clean-button"
                      onClick={cleanCurrentTranscript}
                      title="Clean up repeated words and speech artifacts"
                    >
                      🧹 Clean
                    </button>
                    <button
                      className="clear-button"
                      onClick={clearTranscript}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your voice input will appear here..."
                  className="transcript-textarea"
                />
                <div className="transcript-actions">
                  <button
                    className="send-voice-button"
                    onClick={() => {
                      sendMessage(transcript)
                      setTranscript('')
                    }}
                  >
                    Send Voice Message
                  </button>
                  <button
                    className="copy-button"
                    onClick={() => setNewMessage(transcript)}
                  >
                    Copy to Text Box
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Mode */}
        {currentMode === 'tasks' && (
          <div className="task-mode">
            <h3>Voice Task Creation</h3>
            <p>Use voice to create tasks for your maintenance work</p>
            
            <div className="voice-input-section">
              <button
                className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported}
              >
                {!speechSupported ? '🎤 Voice (Not Supported)' : isListening ? (isActivelyListening ? '🔴 Listening...' : '⏸️ Waiting...') : '🎤 Start Voice Input'}
              </button>
              
              {!speechSupported && (
                <div className="warning-message">
                  ⚠️ Voice input requires Chrome, Edge, or Safari browser
                </div>
              )}
              
              {isActivelyListening && (
                <div className="status-message success">
                  🎯 Actively listening - speak naturally!
                </div>
              )}
              
              {isListening && !isActivelyListening && (
                <div className="status-message waiting">
                  🤔 Waiting for you to think or speak...
                </div>
              )}
            </div>

            {transcript && (
              <div className="transcript-section">
                <div className="transcript-header">
                  <strong>Voice Input (Edit if needed):</strong>
                  <div className="transcript-controls">
                    <button
                      className="clean-button"
                      onClick={cleanCurrentTranscript}
                    >
                      🧹 Clean
                    </button>
                    <button
                      className="clear-button"
                      onClick={clearTranscript}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your voice input will appear here..."
                  className="transcript-textarea"
                />
                <div className="transcript-actions">
                  <button
                    className="auto-detect-button"
                    onClick={() => {
                      // This would integrate with your task system
                      console.log('Auto-detecting tasks from:', transcript)
                      setTranscript('')
                    }}
                  >
                    🧠 Auto-Detect Tasks
                  </button>
                  <button
                    className="single-task-button"
                    onClick={() => {
                      // This would add as a single task
                      console.log('Adding as single task:', transcript)
                      setTranscript('')
                    }}
                  >
                    Add as Single Task
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SmartAssistant 