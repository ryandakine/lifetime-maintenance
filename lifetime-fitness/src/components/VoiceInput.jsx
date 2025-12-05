import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { addTask } from '../store/slices/tasksSlice'
import { addShoppingItem } from '../store/slices/shoppingSlice'

const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceCommands, setVoiceCommands] = useState([])
  const [isContinuousMode, setIsContinuousMode] = useState(false)
  const [feedback, setFeedback] = useState('')
  
  const recognitionRef = useRef(null)
  const dispatch = useDispatch()

  // Voice command registry
  const commandRegistry = {
    // Navigation commands
    'go to dashboard': () => window.location.hash = '#dashboard',
    'go to tasks': () => window.location.hash = '#tasks',
    'go to photos': () => window.location.hash = '#photos',
    'go to shopping': () => window.location.hash = '#shopping',
    'go to maintenance': () => window.location.hash = '#maintenance',
    
    // Task commands
    'create task': (params) => handleCreateTask(params),
    'complete task': (params) => handleCompleteTask(params),
    'delete task': (params) => handleDeleteTask(params),
    'mark task as done': (params) => handleCompleteTask(params),
    
    // Shopping commands
    'add to shopping list': (params) => handleAddShoppingItem(params),
    'buy': (params) => handleAddShoppingItem(params),
    'purchase': (params) => handleAddShoppingItem(params),
    
    // Photo commands
    'take photo': () => handleTakePhoto(),
    'capture image': () => handleTakePhoto(),
    'document equipment': () => handleTakePhoto(),
    
    // System commands
    'stop listening': () => stopListening(),
    'start listening': () => startListening(),
    'help': () => showHelp(),
    'what can I say': () => showHelp(),
    
    // Maintenance commands
    'check equipment': (params) => handleCheckEquipment(params),
    'schedule maintenance': (params) => handleScheduleMaintenance(params),
    'report issue': (params) => handleReportIssue(params)
  }

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
        setFeedback('Listening...')
      }
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setConfidence(confidence)
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase())
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Voice recognition error: ${event.error}`)
        setIsListening(false)
        setFeedback('Error occurred')
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
        setFeedback('Stopped listening')
        
        if (isContinuousMode) {
          setTimeout(() => {
            startListening()
          }, 1000)
        }
      }
    } else {
      setError('Speech recognition not supported in this browser')
    }
  }, [isContinuousMode])

  // Process voice commands with Claude API integration
  const processVoiceCommand = useCallback(async (command) => {
    setIsProcessing(true)
    setFeedback('Processing command...')
    
    try {
      // First, try to match with predefined commands
      const matchedCommand = Object.keys(commandRegistry).find(cmd => 
        command.includes(cmd)
      )
      
      if (matchedCommand) {
        const params = command.replace(matchedCommand, '').trim()
        commandRegistry[matchedCommand](params)
        setFeedback(`Executed: ${matchedCommand}`)
        return
      }
      
      // If no direct match, use Claude API for natural language processing
      const claudeResponse = await processWithClaude(command)
      
      if (claudeResponse.action) {
        executeClaudeAction(claudeResponse)
        setFeedback(`AI processed: ${claudeResponse.action}`)
      } else {
        setFeedback('Command not recognized. Try saying "help" for available commands.')
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error)
      setError('Failed to process command')
      setFeedback('Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Claude API integration for natural language processing
  const processWithClaude = async (command) => {
    try {
      const response = await fetch('/api/claude/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          context: {
            currentTab: window.location.hash.replace('#', ''),
            availableActions: Object.keys(commandRegistry)
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Claude API request failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Claude API error:', error)
      return { action: null, error: error.message }
    }
  }

  // Execute actions from Claude API
  const executeClaudeAction = (response) => {
    switch (response.action) {
      case 'create_task':
        handleCreateTask(response.params)
        break
      case 'add_shopping_item':
        handleAddShoppingItem(response.params)
        break
      case 'navigate':
        window.location.hash = `#${response.params}`
        break
      case 'take_photo':
        handleTakePhoto()
        break
      default:
        console.log('Unknown action from Claude:', response.action)
    }
  }

  // Command handlers
  const handleCreateTask = (description) => {
    if (!description) {
      setFeedback('Please provide a task description')
      return
    }
    
    const task = {
      id: Date.now(),
      title: description,
      description: `Voice-created task: ${description}`,
      status: 'pending',
      priority: 'medium',
      category: 'voice',
      creation_date: new Date().toISOString(),
      voice_created: true
    }
    
    dispatch(addTask(task))
    setFeedback(`Task created: ${description}`)
    setTranscript('')
  }

  const handleCompleteTask = (taskId) => {
    // Implementation for completing tasks
    setFeedback(`Task ${taskId} marked as complete`)
  }

  const handleDeleteTask = (taskId) => {
    // Implementation for deleting tasks
    setFeedback(`Task ${taskId} deleted`)
  }

  const handleAddShoppingItem = (item) => {
    if (!item) {
      setFeedback('Please provide an item name')
      return
    }
    
    const shoppingItem = {
      id: Date.now(),
      name: item,
      category: 'voice',
      quantity: 1,
      priority: 'medium',
      voice_created: true
    }
    
    dispatch(addShoppingItem(shoppingItem))
    setFeedback(`Added to shopping: ${item}`)
    setTranscript('')
  }

  const handleTakePhoto = () => {
    // Trigger photo capture
    const photoButton = document.querySelector('[data-photo-capture]')
    if (photoButton) {
      photoButton.click()
      setFeedback('Photo capture triggered')
    } else {
      setFeedback('Photo capture not available')
    }
  }

  const handleCheckEquipment = (equipment) => {
    setFeedback(`Checking equipment: ${equipment}`)
  }

  const handleScheduleMaintenance = (equipment) => {
    setFeedback(`Scheduling maintenance for: ${equipment}`)
  }

  const handleReportIssue = (issue) => {
    setFeedback(`Issue reported: ${issue}`)
  }

  const showHelp = () => {
    const commands = Object.keys(commandRegistry).map(cmd => `"${cmd}"`).join(', ')
    setFeedback(`Available commands: ${commands}`)
  }

  // Control functions
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsContinuousMode(false)
  }

  const toggleContinuousMode = () => {
    setIsContinuousMode(!isContinuousMode)
    if (!isContinuousMode && !isListening) {
      startListening()
    }
  }

  // Haptic feedback for mobile
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  // Mobile optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isListening) {
        stopListening()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isListening])

  return (
    <div className="voice-input-container" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      minWidth: '300px',
      maxWidth: '400px'
    }}>
      {/* Status Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isListening ? '#4CAF50' : '#ccc',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: isListening ? '#4CAF50' : '#666'
          }}>
            {isListening ? 'Listening' : 'Voice Off'}
          </span>
        </div>
        
        {confidence > 0 && (
          <div style={{
            fontSize: '12px',
            color: '#666'
          }}>
            Confidence: {Math.round(confidence * 100)}%
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px',
          minHeight: '40px',
          wordWrap: 'break-word'
        }}>
          "{transcript}"
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div style={{
          background: '#e3f2fd',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#1976d2'
        }}>
          {feedback}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#ffebee',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#d32f2f'
        }}>
          {error}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => {
            if (isListening) {
              stopListening()
            } else {
              startListening()
            }
            triggerHapticFeedback()
          }}
          disabled={isProcessing}
          style={{
            background: isListening ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            flex: 1,
            minWidth: '120px'
          }}
        >
          {isListening ? 'Stop' : 'Start'} Listening
        </button>

        <button
          onClick={toggleContinuousMode}
          style={{
            background: isContinuousMode ? '#ff9800' : '#2196F3',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {isContinuousMode ? 'Continuous' : 'Auto'}
        </button>

        <button
          onClick={() => {
            showHelp()
            triggerHapticFeedback()
          }}
          style={{
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Help
        </button>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '10px',
          gap: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '12px', color: '#666' }}>
            Processing...
          </span>
        </div>
      )}

      {/* Quick Commands */}
      <div style={{
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '8px'
        }}>
          Quick Commands:
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px'
        }}>
          {['"create task"', '"take photo"', '"go to tasks"', '"help"'].map(cmd => (
            <button
              key={cmd}
              onClick={() => {
                setTranscript(cmd.replace(/"/g, ''))
                processVoiceCommand(cmd.replace(/"/g, ''))
              }}
              style={{
                background: '#f0f0f0',
                border: '1px solid #ddd',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .voice-input-container {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}

export default VoiceInput 