import React, { useState, useEffect, useRef } from 'react'

const VoiceRecorder = ({ onTranscript, isCompact = false, placeholder = 'Listening...' }) => {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setError('')
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setIsListening(false)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied.')
      } else {
        setError('Error listening. Please try again.')
      }
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript])

  const toggleListening = (e) => {
    e.preventDefault() // Prevent form submission if inside a form
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setError('')
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setError('Could not start voice input.')
      }
    }
  }

  if (isCompact) {
    return (
      <div className="voice-recorder-compact" style={{ display: 'inline-block', marginLeft: '8px' }}>
        <button
          type="button"
          onClick={toggleListening}
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
          style={{
            background: isListening ? '#e74c3c' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? '⏹️' : '🎤'}
        </button>
      </div>
    )
  }

  return (
    <div className="voice-recorder">
      <button
        type="button"
        onClick={toggleListening}
        className={`voice-btn-full ${isListening ? 'listening' : ''}`}
        style={{
          background: isListening ? '#e74c3c' : '#3498db',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        <span>{isListening ? '⏹️ Stop Listening' : '🎤 Voice Input'}</span>
      </button>
      
      {isListening && (
        <span className="listening-text" style={{ marginLeft: '10px', color: '#e74c3c', fontSize: '12px', fontStyle: 'italic' }}>
          {placeholder}
        </span>
      )}
      
      {error && (
        <div className="voice-error" style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
