import React, { useState, useEffect, useRef } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Brain, 
  Mic, 
  Square, 
  Check, 
  Target, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Calendar,
  MessageSquare,
  Zap,
  Star,
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  Bell,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const SmartAssistant = ({ isMobile }) => {
  console.log('Smart Assistant loaded - Your AI companion is ready!')
  
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [assistantMessage, setAssistantMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantMode, setAssistantMode] = useState('general') // general, goals, tasks, insights
  const [insights, setInsights] = useState([])
  const [reminders, setReminders] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [userContext, setUserContext] = useState({
    currentGoals: [],
    recentTasks: [],
    productivityScore: 0,
    focusAreas: [],
    timeOfDay: 'morning'
  })
  
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    initializeAssistant()
    loadUserContext()
    startProactiveMonitoring()
  }, [])

  useEffect(() => {
    const hour = new Date().getHours()
    let timeOfDay = 'morning'
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
    else if (hour >= 17) timeOfDay = 'evening'
    
    setUserContext(prev => ({ ...prev, timeOfDay }))
  }, [])

  const initializeAssistant = async () => {
    // Load user preferences and context
    const savedContext = localStorage.getItem('assistantContext')
    if (savedContext) {
      setUserContext(JSON.parse(savedContext))
    }
    
    // Generate initial insights
    await generateInsights()
    
    // Set up proactive reminders
    setupProactiveReminders()
  }

  const loadUserContext = async () => {
    try {
      // Load goals
      const { data: goals } = await supabase
        .from(TABLES.GOALS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Load recent tasks
      const { data: tasks } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Load monetary goals
      const { data: monetaryGoals } = await supabase
        .from(TABLES.MONETARY_GOALS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      setUserContext(prev => ({
        ...prev,
        currentGoals: goals || [],
        recentTasks: tasks || [],
        monetaryGoals: monetaryGoals || []
      }))

      localStorage.setItem('assistantContext', JSON.stringify({
        ...prev,
        currentGoals: goals || [],
        recentTasks: tasks || [],
        monetaryGoals: monetaryGoals || []
      }))
    } catch (error) {
      console.error('Error loading user context:', error)
    }
  }

  const startProactiveMonitoring = () => {
    // Monitor user activity and provide proactive assistance
    setInterval(async () => {
      await checkForProactiveActions()
    }, 300000) // Every 5 minutes
  }

  const checkForProactiveActions = async () => {
    const now = new Date()
    const hour = now.getHours()
    
    // Morning routine suggestions
    if (hour === 7 && !localStorage.getItem('morningCheckIn')) {
      addReminder({
        type: 'morning',
        title: 'Good Morning! 🌅',
        message: 'Time to review your goals and plan your day. Would you like me to help you prioritize your tasks?',
        priority: 'high',
        action: 'morning_routine'
      })
      localStorage.setItem('morningCheckIn', 'true')
    }

    // Goal progress check
    if (hour === 12) {
      await checkGoalProgress()
    }

    // Evening reflection
    if (hour === 20) {
      addReminder({
        type: 'evening',
        title: 'Evening Reflection 🌙',
        message: 'How did your day go? Let\'s review your progress and plan for tomorrow.',
        priority: 'medium',
        action: 'evening_reflection'
      })
    }

    // Weekly review
    const dayOfWeek = now.getDay()
    if (dayOfWeek === 0 && hour === 10) { // Sunday morning
      await generateWeeklyInsights()
    }
  }

  const checkGoalProgress = async () => {
    const goals = userContext.currentGoals
    const tasks = userContext.recentTasks
    
    let completedToday = 0
    let totalToday = 0
    
    tasks.forEach(task => {
      const taskDate = new Date(task.created_at).toDateString()
      const today = new Date().toDateString()
      
      if (taskDate === today) {
        totalToday++
        if (task.status === 'completed') completedToday++
      }
    })

    const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0
    
    if (progress < 50) {
      addReminder({
        type: 'productivity',
        title: 'Productivity Boost Needed! ⚡',
        message: `You've completed ${completedToday}/${totalToday} tasks today. Let me help you get back on track!`,
        priority: 'high',
        action: 'productivity_boost'
      })
    } else if (progress >= 80) {
      addReminder({
        type: 'celebration',
        title: 'Great Progress! 🎉',
        message: `You're crushing it today! ${completedToday}/${totalToday} tasks completed. Keep up the momentum!`,
        priority: 'low',
        action: 'celebration'
      })
    }
  }

  const generateWeeklyInsights = async () => {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Based on this user data, provide weekly insights and recommendations:
                Goals: ${JSON.stringify(userContext.currentGoals)}
                Recent Tasks: ${JSON.stringify(userContext.recentTasks)}
                Monetary Goals: ${JSON.stringify(userContext.monetaryGoals)}
                
                Provide:
                1. Progress summary
                2. Areas for improvement
                3. Next week's focus areas
                4. Specific actionable recommendations
                
                Format as JSON with keys: summary, improvements, focusAreas, recommendations`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const insights = JSON.parse(data.choices[0].message.content)
        setInsights(insights)
      }
    } catch (error) {
      console.error('Error generating weekly insights:', error)
    }
  }

  const generateInsights = async () => {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Analyze this user data and provide intelligent insights and suggestions:
                Current Goals: ${JSON.stringify(userContext.currentGoals)}
                Recent Tasks: ${JSON.stringify(userContext.recentTasks)}
                Time of Day: ${userContext.timeOfDay}
                
                Provide:
                1. Current status assessment
                2. Priority recommendations
                3. Smart suggestions for the current time
                4. Potential obstacles and solutions
                
                Format as JSON with keys: status, priorities, suggestions, obstacles`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const insights = JSON.parse(data.choices[0].message.content)
        setInsights(insights)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    }
  }

  const setupProactiveReminders = () => {
    // Set up smart reminders based on user patterns
    const reminders = [
      {
        id: 1,
        type: 'goal',
        title: 'Goal Progress Check',
        message: 'Time to check in on your goals. How are you progressing?',
        time: '09:00',
        frequency: 'daily'
      },
      {
        id: 2,
        type: 'productivity',
        title: 'Productivity Peak',
        message: 'This is typically your most productive time. Focus on your most important task!',
        time: '10:00',
        frequency: 'daily'
      },
      {
        id: 3,
        type: 'break',
        title: 'Take a Break',
        message: 'You\'ve been working hard. Time for a short break to recharge!',
        time: '15:00',
        frequency: 'daily'
      }
    ]
    
    setReminders(reminders)
  }

  const addReminder = (reminder) => {
    setReminders(prev => [...prev, { ...reminder, id: Date.now() }])
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setAssistantMessage('Speech recognition not supported in your browser.')
      return
    }

    setIsListening(true)
    setTranscript('')
    setAssistantMessage('Listening... Speak now!')

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('Voice recognition started')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      setTranscript(finalTranscript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setAssistantMessage('Voice recognition error. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript.trim()) {
        processVoiceCommand(transcript)
      }
    }

    recognitionRef.current = recognition
    recognition.start()

    // Auto-stop after 10 seconds
    timeoutRef.current = setTimeout(() => {
      recognition.stop()
    }, 10000)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsListening(false)
  }

  const processVoiceCommand = async (command) => {
    setIsProcessing(true)
    setAssistantMessage('Processing your request...')

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an intelligent personal assistant helping a user manage their life. 
                User Context: ${JSON.stringify(userContext)}
                Current Time: ${userContext.timeOfDay}
                
                Respond as a helpful, proactive assistant. Provide specific, actionable advice.
                If the user asks for help with tasks, goals, or productivity, give concrete suggestions.
                Always be encouraging and supportive.`
            },
            {
              role: 'user',
              content: command
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantResponse = data.choices[0].message.content
        setAssistantMessage(assistantResponse)
        
        // Auto-generate suggestions based on the conversation
        await generateSuggestionsFromCommand(command, assistantResponse)
      } else {
        setAssistantMessage('I apologize, but I\'m having trouble processing your request right now. Please try again.')
      }
    } catch (error) {
      console.error('Error processing voice command:', error)
      setAssistantMessage('I encountered an error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateSuggestionsFromCommand = async (command, response) => {
    try {
      const suggestionResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Based on this conversation:
                User Command: "${command}"
                Assistant Response: "${response}"
                
                Generate 3-5 specific, actionable suggestions for the user.
                Format as JSON array: ["suggestion1", "suggestion2", "suggestion3"]`
            }
          ]
        })
      })

      if (suggestionResponse.ok) {
        const data = await suggestionResponse.json()
        const suggestions = JSON.parse(data.choices[0].message.content)
        setSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }

  const handleQuickAction = async (action) => {
    setIsProcessing(true)
    
    switch (action) {
      case 'morning_routine':
        await processVoiceCommand('Help me plan my morning routine and prioritize my tasks for today')
        break
      case 'evening_reflection':
        await processVoiceCommand('Help me reflect on my day and plan for tomorrow')
        break
      case 'productivity_boost':
        await processVoiceCommand('I need help getting more productive. What should I focus on?')
        break
      case 'goal_review':
        await processVoiceCommand('Review my current goals and suggest next steps')
        break
      case 'smart_suggestions':
        await generateInsights()
        break
      default:
        setAssistantMessage('Quick action executed!')
    }
    
    setIsProcessing(false)
  }

  const renderInsights = () => {
    if (!insights || Object.keys(insights).length === 0) return null

    return (
      <div className="insights-section">
        <h3><Sparkles size={20} /> Smart Insights</h3>
        
        {insights.status && (
          <div className="insight-card">
            <h4>Current Status</h4>
            <p>{insights.status}</p>
          </div>
        )}
        
        {insights.priorities && (
          <div className="insight-card">
            <h4>Priorities</h4>
            <ul>
              {insights.priorities.map((priority, index) => (
                <li key={index}>{priority}</li>
              ))}
            </ul>
          </div>
        )}
        
        {insights.suggestions && (
          <div className="insight-card">
            <h4>Smart Suggestions</h4>
            <ul>
              {insights.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const renderReminders = () => {
    if (reminders.length === 0) return null

    return (
      <div className="reminders-section">
        <h3><Bell size={20} /> Smart Reminders</h3>
        {reminders.slice(0, 3).map(reminder => (
          <div key={reminder.id} className={`reminder-card ${reminder.priority}`}>
            <div className="reminder-header">
              <h4>{reminder.title}</h4>
              <span className={`priority-badge ${reminder.priority}`}>
                {reminder.priority}
              </span>
            </div>
            <p>{reminder.message}</p>
            <button 
              onClick={() => handleQuickAction(reminder.action)}
              className="action-btn"
            >
              Take Action <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null

    return (
      <div className="suggestions-section">
        <h3><Lightbulb size={20} /> Smart Suggestions</h3>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-card">
            <p>{suggestion}</p>
            <button 
              onClick={() => processVoiceCommand(suggestion)}
              className="suggestion-btn"
            >
              Try This <Zap size={16} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="smart-assistant">
      {/* Floating Assistant Button */}
      <button
        onClick={() => setShowAssistant(!showAssistant)}
        className={`assistant-toggle ${showAssistant ? 'active' : ''}`}
        style={{
          position: 'fixed',
          bottom: isMobile ? '20px' : '40px',
          right: isMobile ? '20px' : '40px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: showAssistant ? 'var(--primary-color)' : 'linear-gradient(135deg, #007BFF, #1a3d2f)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isListening ? (
          <Mic size={24} style={{ animation: 'pulse 1s infinite' }} />
        ) : (
          <Brain size={24} />
        )}
      </button>

      {/* Assistant Panel */}
      {showAssistant && (
        <div className="assistant-panel" style={{
          position: 'fixed',
          bottom: isMobile ? '100px' : '120px',
          right: isMobile ? '20px' : '40px',
          width: isMobile ? 'calc(100vw - 40px)' : '400px',
          maxHeight: '70vh',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div className="assistant-header" style={{
            background: 'linear-gradient(135deg, #007BFF, #1a3d2f)',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} />
              <h3 style={{ margin: 0 }}>Smart Assistant</h3>
            </div>
            <button
              onClick={() => setShowAssistant(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="assistant-content" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem'
          }}>
            {/* Quick Actions */}
            <div className="quick-actions" style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Quick Actions</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleQuickAction('morning_routine')}
                  className="quick-action-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  🌅 Morning
                </button>
                <button
                  onClick={() => handleQuickAction('goal_review')}
                  className="quick-action-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--success-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  🎯 Goals
                </button>
                <button
                  onClick={() => handleQuickAction('smart_suggestions')}
                  className="quick-action-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--warning-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  💡 Insights
                </button>
              </div>
            </div>

            {/* Voice Input */}
            <div className="voice-section" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className="voice-btn"
                  style={{
                    padding: '0.75rem',
                    background: isListening ? 'var(--error-color)' : 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isListening ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Ask me anything or use voice..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && transcript.trim()) {
                        processVoiceCommand(transcript)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Assistant Response */}
            {assistantMessage && (
              <div className="assistant-response" style={{
                background: 'var(--light-color)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Brain size={16} style={{ marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {isProcessing ? 'Thinking...' : assistantMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {renderSuggestions()}

            {/* Insights */}
            {renderInsights()}

            {/* Reminders */}
            {renderReminders()}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .insight-card, .reminder-card, .suggestion-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .reminder-card.high {
          border-left: 4px solid var(--error-color);
        }
        
        .reminder-card.medium {
          border-left: 4px solid var(--warning-color);
        }
        
        .reminder-card.low {
          border-left: 4px solid var(--success-color);
        }
        
        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .priority-badge.high {
          background: var(--error-color);
          color: white;
        }
        
        .priority-badge.medium {
          background: var(--warning-color);
          color: white;
        }
        
        .priority-badge.low {
          background: var(--success-color);
          color: white;
        }
        
        .action-btn, .suggestion-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .reminder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .reminder-header h4 {
          margin: 0;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}

export default SmartAssistant 