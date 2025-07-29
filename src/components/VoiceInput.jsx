import React, { useState, useEffect, useRef } from 'react'
import './VoiceInput.css'

const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [workflowResults, setWorkflowResults] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const recognitionRef = useRef(null)
  const accumulatedTextRef = useRef('')

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false // Set to false for better control
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        // Generate new conversation ID if starting fresh
        if (!conversationId) {
          setConversationId(Date.now().toString())
        }
      }
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // Update the accumulated text
        if (finalTranscript) {
          accumulatedTextRef.current += (accumulatedTextRef.current ? ' ' : '') + finalTranscript
          setCurrentTranscript(accumulatedTextRef.current)
        } else if (interimTranscript) {
          // Show accumulated text + current interim
          setCurrentTranscript(accumulatedTextRef.current + (accumulatedTextRef.current ? ' ' : '') + interimTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
        // Keep the accumulated text visible
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [conversationId])

  const addToConversation = (text) => {
    if (text.trim()) {
      setConversationHistory(prev => [...prev, {
        id: Date.now(),
        text: text.trim(),
        timestamp: new Date().toISOString(),
        type: 'user'
      }])
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const startNewConversation = () => {
    setConversationHistory([])
    setCurrentTranscript('')
    setConversationId(null)
    setWorkflowResults([])
    accumulatedTextRef.current = ''
  }

  const clearCurrentTranscript = () => {
    setCurrentTranscript('')
    accumulatedTextRef.current = ''
  }

  const cleanConversation = () => {
    setConversationHistory(prev => prev.map(item => ({
      ...item,
      text: item.text
        .replace(/\b(um|uh|er|ah|like|you know)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    })))
  }

  const triggerWorkflow = async (workflowType, data) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/n8n/${workflowType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      
      setWorkflowResults(prev => [...prev, {
        id: Date.now(),
        type: workflowType,
        input: data,
        result,
        timestamp: new Date().toISOString()
      }])
      
      return result
    } catch (error) {
      console.error('Workflow error:', error)
      setWorkflowResults(prev => [...prev, {
        id: Date.now(),
        type: workflowType,
        input: data,
        error: error.message,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const processVoiceCommand = async () => {
    // Get the current transcript (what's in the text box)
    const currentText = currentTranscript.trim()
    if (!currentText) return

    // Add current text to conversation history
    addToConversation(currentText)
    
    // Clear the current transcript after processing
    setCurrentTranscript('')
    accumulatedTextRef.current = ''

    const command = currentText.toLowerCase()
    
    // Simple command parsing
    if (command.includes('email') || command.includes('send')) {
      await triggerWorkflow('email-automation', {
        topic: currentText,
        recipient: 'team@lifetimefitness.com',
        urgency: 'normal'
      })
    } else if (command.includes('task') || command.includes('add task')) {
      await triggerWorkflow('task-processing', {
        description: currentText,
        priority: 'medium',
        source: 'voice'
      })
    } else if (command.includes('shopping') || command.includes('buy')) {
      await triggerWorkflow('shopping-processing', {
        item: currentText,
        quantity: 1,
        urgency: 'medium'
      })
    } else if (command.includes('photo') || command.includes('picture')) {
      await triggerWorkflow('photo-analysis', {
        description: currentText,
        category: 'equipment-maintenance'
      })
    } else {
      // Default to AI assistant
      await triggerWorkflow('ai-assistant', {
        message: currentText,
        context: 'voice-command'
      })
    }
  }

  return (
    <div className="voice-input">
      <div className="voice-header">
        <h2>🎤 Voice Input</h2>
        <p>Speak your maintenance tasks and commands</p>
      </div>

      {/* Voice Controls */}
      <div className="voice-controls">
        <div className="control-buttons">
          <button
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {isListening ? '🛑 Stop' : '🎤 Start Listening'}
          </button>
          
          <button
            className="voice-button secondary"
            onClick={startNewConversation}
            disabled={isProcessing}
          >
            🆕 New Conversation
          </button>
          
          <button
            className="voice-button secondary"
            onClick={clearCurrentTranscript}
            disabled={!currentTranscript || isProcessing}
          >
            🗑️ Clear Text
          </button>
          
          <button
            className="voice-button secondary"
            onClick={cleanConversation}
            disabled={conversationHistory.length === 0 || isProcessing}
          >
            🧹 Clean All
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`status-indicator ${isListening ? 'active' : ''}`}>
          <div className="pulse-dot"></div>
          <span>{isListening ? 'Listening...' : 'Ready'}</span>
        </div>
      </div>

      {/* Current Text Box */}
      <div className="current-text-section">
        <h3>📝 Your Text</h3>
        <div className="current-text-display">
          {currentTranscript ? (
            <div className="current-text-content">
              <p className="current-text">{currentTranscript}</p>
              <div className="text-actions">
                <span className="text-status">
                  {isListening ? '🎤 Speaking...' : '📝 Ready to send'}
                </span>
              </div>
            </div>
          ) : (
            <p className="current-text-placeholder">
              Start speaking to see your text here...
            </p>
          )}
        </div>
      </div>

      {/* Process Button */}
      <div className="process-section">
        <button
          className="process-button"
          onClick={processVoiceCommand}
          disabled={!currentTranscript.trim() || isProcessing}
        >
          {isProcessing ? '🔄 Processing...' : '🚀 Send Text'}
        </button>
      </div>

      {/* Conversation Display */}
      <div className="conversation-section">
        <h3>💬 Conversation History</h3>
        <div className="conversation-display">
          {conversationHistory.length === 0 ? (
            <p className="conversation-placeholder">
              No messages sent yet. Speak and click "Send Text" to start your conversation...
            </p>
          ) : (
            <div className="conversation-content">
              {/* Show conversation history */}
              {conversationHistory.map((item, index) => (
                <div key={item.id} className="conversation-item">
                  <div className="conversation-bubble">
                    <p className="conversation-text">{item.text}</p>
                    <span className="conversation-time">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Commands Help */}
      <div className="commands-help">
        <h3>💡 How It Works</h3>
        <div className="commands-grid">
          <div className="command-item">
            <span className="command-example">🎤 Click "Start Listening"</span>
            <span className="command-description">Begin speaking</span>
          </div>
          <div className="command-item">
            <span className="command-example">⏸️ Pause talking</span>
            <span className="command-description">Click "Stop" - text stays visible</span>
          </div>
          <div className="command-item">
            <span className="command-example">🎤 Resume talking</span>
            <span className="command-description">Click "Start Listening" - adds to existing text</span>
          </div>
          <div className="command-item">
            <span className="command-example">🚀 Send when ready</span>
            <span className="command-description">Click "Send Text" to process</span>
          </div>
          <div className="command-item">
            <span className="command-example">🆕 New topic</span>
            <span className="command-description">Click "New Conversation" to start fresh</span>
          </div>
        </div>
      </div>

      {/* Workflow Results */}
      <div className="workflow-results">
        <h3>🔄 Recent Commands</h3>
        {workflowResults.length === 0 ? (
          <p className="no-results">No commands processed yet. Try speaking a command!</p>
        ) : (
          <div className="results-list">
            {workflowResults.slice(-5).reverse().map(result => (
              <div key={result.id} className={`result-item ${result.error ? 'error' : 'success'}`}>
                <div className="result-header">
                  <span className="result-type">{result.type}</span>
                  <span className="result-time">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="result-content">
                  <p className="result-input">"{result.input?.message || result.input?.topic || 'Voice command'}"</p>
                  {result.error ? (
                    <p className="error-message">❌ {result.error}</p>
                  ) : (
                    <p className="success-message">✅ Command processed successfully</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceInput 