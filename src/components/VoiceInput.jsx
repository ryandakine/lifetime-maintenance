import React, { useState, useEffect, useRef } from 'react'
import './VoiceInput.css'

const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [workflowResults, setWorkflowResults] = useState([])
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
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
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

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

  const clearTranscript = () => {
    setTranscript('')
  }

  const cleanTranscript = () => {
    // Remove common speech artifacts
    let cleaned = transcript
      .replace(/\b(um|uh|er|ah|like|you know)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
    setTranscript(cleaned)
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
    if (!transcript.trim()) return

    const command = transcript.toLowerCase()
    
    // Simple command parsing
    if (command.includes('email') || command.includes('send')) {
      await triggerWorkflow('email-automation', {
        topic: transcript,
        recipient: 'team@lifetimefitness.com',
        urgency: 'normal'
      })
    } else if (command.includes('task') || command.includes('add task')) {
      await triggerWorkflow('task-processing', {
        description: transcript,
        priority: 'medium',
        source: 'voice'
      })
    } else if (command.includes('shopping') || command.includes('buy')) {
      await triggerWorkflow('shopping-processing', {
        item: transcript,
        quantity: 1,
        urgency: 'medium'
      })
    } else if (command.includes('photo') || command.includes('picture')) {
      await triggerWorkflow('photo-analysis', {
        description: transcript,
        category: 'equipment-maintenance'
      })
    } else {
      // Default to AI assistant
      await triggerWorkflow('ai-assistant', {
        message: transcript,
        context: 'voice-command'
      })
    }
  }

  return (
    <div className="voice-input">
      <div className="voice-header">
        <h2>🎤 Voice Commands</h2>
        <p>Use your voice to control maintenance workflows</p>
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
            onClick={clearTranscript}
            disabled={!transcript || isProcessing}
          >
            🗑️ Clear
          </button>
          
          <button
            className="voice-button secondary"
            onClick={cleanTranscript}
            disabled={!transcript || isProcessing}
          >
            🧹 Clean
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`status-indicator ${isListening ? 'active' : ''}`}>
          <div className="pulse-dot"></div>
          <span>{isListening ? 'Listening...' : 'Ready'}</span>
        </div>
      </div>

      {/* Transcript Display */}
      <div className="transcript-section">
        <h3>📝 Transcript</h3>
        <div className="transcript-display">
          {transcript ? (
            <p className="transcript-text">{transcript}</p>
          ) : (
            <p className="transcript-placeholder">
              Start speaking to see your transcript here...
            </p>
          )}
        </div>
      </div>

      {/* Process Button */}
      <div className="process-section">
        <button
          className="process-button"
          onClick={processVoiceCommand}
          disabled={!transcript.trim() || isProcessing}
        >
          {isProcessing ? '🔄 Processing...' : '🚀 Process Command'}
        </button>
      </div>

      {/* Voice Commands Help */}
      <div className="commands-help">
        <h3>💡 Voice Commands</h3>
        <div className="commands-grid">
          <div className="command-item">
            <span className="command-example">"Send email about equipment maintenance"</span>
            <span className="command-description">Triggers email automation</span>
          </div>
          <div className="command-item">
            <span className="command-example">"Add task to check treadmill"</span>
            <span className="command-description">Creates a new task</span>
          </div>
          <div className="command-item">
            <span className="command-example">"Buy treadmill belt"</span>
            <span className="command-description">Adds to shopping list</span>
          </div>
          <div className="command-item">
            <span className="command-example">"Take photo of equipment damage"</span>
            <span className="command-description">Triggers photo analysis</span>
          </div>
          <div className="command-item">
            <span className="command-example">"What maintenance tasks are due today?"</span>
            <span className="command-description">AI assistant query</span>
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