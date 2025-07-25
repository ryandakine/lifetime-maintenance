import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  DollarSign, 
  Target, 
  Dumbbell, 
  Heart, 
  Plus, 
  Check, 
  Trash2, 
  Edit,
  Calendar,
  Clock,
  TrendingUp,
  BookOpen,
  Brain,
  Mic,
  Square,
  X
} from 'lucide-react'

const OffDays = () => {
  console.log('Off-days feature loaded')
  
  const [activeTab, setActiveTab] = useState('monetary')
  
  // Lazy load GoalTracker component
  const GoalTracker = React.lazy(() => import('./GoalTracker'))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // State for different categories
  const [monetaryGoals, setMonetaryGoals] = useState([])
  const [generalGoals, setGeneralGoals] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [spiritualNotes, setSpiritualNotes] = useState([])
  
  // Form states
  const [monetaryForm, setMonetaryForm] = useState({ description: '', amount: '', deadline: '' })
  const [goalsForm, setGoalsForm] = useState({ category: '', description: '', progress: 0 })
  const [workoutForm, setWorkoutForm] = useState({ type: '', description: '', duration: '', nutrition: '' })
  const [spiritualForm, setSpiritualForm] = useState({ reflection: '', gratitude: '', prayer: '' })
  
  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [listeningTimeout, setListeningTimeout] = useState(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceModalText, setVoiceModalText] = useState('')
  const [voiceModalListening, setVoiceModalListening] = useState(false)
  const [voiceModalRecognitionRef, setVoiceModalRecognitionRef] = useState(null)
  const [voiceMode, setVoiceMode] = useState('description')

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState({})

  useEffect(() => {
    loadAllData()
    handleOnline()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleOnline = () => setIsOnline(true)
  const handleOffline = () => setIsOnline(false)

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadMonetaryGoals(),
        loadGeneralGoals(),
        loadWorkouts(),
        loadSpiritualNotes()
      ])
    } catch (error) {
      console.error('Error loading off-days data:', error)
      showMessage('error', 'Failed to load data')
    }
  }

  const loadMonetaryGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('monetary_goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMonetaryGoals(data || [])
    } catch (error) {
      console.error('Error loading monetary goals:', error)
      setMonetaryGoals([])
    }
  }

  const loadGeneralGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGeneralGoals(data || [])
    } catch (error) {
      console.error('Error loading general goals:', error)
      setGeneralGoals([])
    }
  }

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkouts(data || [])
    } catch (error) {
      console.error('Error loading workouts:', error)
      setWorkouts([])
    }
  }

  const loadSpiritualNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('spiritual')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSpiritualNotes(data || [])
    } catch (error) {
      console.error('Error loading spiritual notes:', error)
      setSpiritualNotes([])
    }
  }

  // Monetary Goals Functions
  const addMonetaryGoal = async (e) => {
    e.preventDefault()
    if (!monetaryForm.description.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('monetary_goals')
        .insert([{
          description: monetaryForm.description,
          amount: parseFloat(monetaryForm.amount) || 0,
          deadline: monetaryForm.deadline || null,
          completed: false
        }])

      if (error) throw error

      setMonetaryForm({ description: '', amount: '', deadline: '' })
      await loadMonetaryGoals()
      showMessage('success', 'Monetary goal added successfully')
      
      // Get AI suggestions
      await getMonetarySuggestions(monetaryForm.description)
    } catch (error) {
      console.error('Error adding monetary goal:', error)
      showMessage('error', 'Failed to add monetary goal')
    } finally {
      setLoading(false)
    }
  }

  const toggleMonetaryGoal = async (id, completed) => {
    try {
      const { error } = await supabase
        .from('monetary_goals')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) throw error
      await loadMonetaryGoals()
    } catch (error) {
      console.error('Error updating monetary goal:', error)
      showMessage('error', 'Failed to update goal')
    }
  }

  // General Goals Functions
  const addGeneralGoal = async (e) => {
    e.preventDefault()
    if (!goalsForm.description.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          category: goalsForm.category,
          description: goalsForm.description,
          progress: goalsForm.progress,
          completed: false
        }])

      if (error) throw error

      setGoalsForm({ category: '', description: '', progress: 0 })
      await loadGeneralGoals()
      showMessage('success', 'Goal added successfully')
    } catch (error) {
      console.error('Error adding goal:', error)
      showMessage('error', 'Failed to add goal')
    } finally {
      setLoading(false)
    }
  }

  const updateGoalProgress = async (id, progress) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ progress })
        .eq('id', id)

      if (error) throw error
      await loadGeneralGoals()
    } catch (error) {
      console.error('Error updating goal progress:', error)
      showMessage('error', 'Failed to update progress')
    }
  }

  // Workout Functions
  const addWorkout = async (e) => {
    e.preventDefault()
    if (!workoutForm.description.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert([{
          type: workoutForm.type,
          description: workoutForm.description,
          duration: workoutForm.duration,
          nutrition: workoutForm.nutrition,
          completed: false
        }])

      if (error) throw error

      setWorkoutForm({ type: '', description: '', duration: '', nutrition: '' })
      await loadWorkouts()
      showMessage('success', 'Workout added successfully')
      
      // Get AI suggestions
      await getWorkoutSuggestions(workoutForm.description)
    } catch (error) {
      console.error('Error adding workout:', error)
      showMessage('error', 'Failed to add workout')
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkout = async (id, completed) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) throw error
      await loadWorkouts()
    } catch (error) {
      console.error('Error updating workout:', error)
      showMessage('error', 'Failed to update workout')
    }
  }

  // Spiritual Functions
  const addSpiritualNote = async (e) => {
    e.preventDefault()
    if (!spiritualForm.reflection.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('spiritual')
        .insert([{
          reflection: spiritualForm.reflection,
          gratitude: spiritualForm.gratitude,
          prayer: spiritualForm.prayer
        }])

      if (error) throw error

      setSpiritualForm({ reflection: '', gratitude: '', prayer: '' })
      await loadSpiritualNotes()
      showMessage('success', 'Spiritual note added successfully')
      
      // Get AI guidance
      await getSpiritualGuidance(spiritualForm.reflection)
    } catch (error) {
      console.error('Error adding spiritual note:', error)
      showMessage('error', 'Failed to add spiritual note')
    } finally {
      setLoading(false)
    }
  }

  // AI Functions
  const getMonetarySuggestions = async (description) => {
    if (!API_KEYS.PERPLEXITY_API_KEY) return

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
              content: `Provide financial tips and suggestions for: ${description}. Include budgeting advice, saving strategies, and investment considerations.`
            }
          ]
        })
      })

      if (!response.ok) throw new Error('API request failed')
      
      const data = await response.json()
      const suggestions = data.choices[0].message.content
      
      setAiSuggestions(prev => ({
        ...prev,
        monetary: suggestions
      }))
    } catch (error) {
      console.error('Error getting monetary suggestions:', error)
    }
  }

  const getWorkoutSuggestions = async (description) => {
    if (!API_KEYS.GROK_API_KEY) return

    try {
      const response = await fetch('https://api.grok.ai/fitness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.GROK_API_KEY}`
        },
        body: JSON.stringify({
          workout: description,
          request: 'nutrition_advice'
        })
      })

      if (!response.ok) throw new Error('API request failed')
      
      const data = await response.json()
      const suggestions = data.advice
      
      setAiSuggestions(prev => ({
        ...prev,
        workout: suggestions
      }))
    } catch (error) {
      console.error('Error getting workout suggestions:', error)
    }
  }

  const getSpiritualGuidance = async (reflection) => {
    if (!API_KEYS.CLAUDE_API_KEY) return

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEYS.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `Provide spiritual guidance and reflection for: ${reflection}. Include biblical wisdom, prayer suggestions, and growth insights.`
            }
          ]
        })
      })

      if (!response.ok) throw new Error('API request failed')
      
      const data = await response.json()
      const guidance = data.content[0].text
      
      setAiSuggestions(prev => ({
        ...prev,
        spiritual: guidance
      }))
    } catch (error) {
      console.error('Error getting spiritual guidance:', error)
    }
  }

  // Voice Input Functions
  const startListening = (mode = 'description') => {
    if (!('webkitSpeechRecognition' in window)) {
      showMessage('error', 'Speech recognition not supported')
      return
    }

    setVoiceMode(mode)
    setIsListening(true)
    setTranscript('')

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
      showMessage('error', 'Voice recognition error')
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript.trim()) {
        applyVoiceInput(transcript, mode)
      }
    }

    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const applyVoiceInput = (text, mode) => {
    switch (mode) {
      case 'monetary':
        setMonetaryForm(prev => ({ ...prev, description: text }))
        break
      case 'goals':
        setGoalsForm(prev => ({ ...prev, description: text }))
        break
      case 'workout':
        setWorkoutForm(prev => ({ ...prev, description: text }))
        break
      case 'spiritual':
        setSpiritualForm(prev => ({ ...prev, reflection: text }))
        break
      default:
        break
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const tabs = [
    { id: 'monetary', name: 'Monetary', icon: <DollarSign size={20} /> },
    { id: 'goals', name: 'Goals', icon: <Target size={20} /> },
    { id: 'workouts', name: 'Workouts', icon: <Dumbbell size={20} /> },
    { id: 'spiritual', name: 'Spiritual', icon: <Heart size={20} /> },
    { id: 'tracker', name: 'Goal Tracker', icon: <TrendingUp size={20} /> }
  ]

  const renderMonetaryTab = () => (
    <div className="tab-content">
      <div className="card">
        <h3>Financial Goals</h3>
        <form onSubmit={addMonetaryGoal}>
          <div className="form-group">
            <label className="form-label">Goal Description</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={monetaryForm.description}
                onChange={(e) => setMonetaryForm({...monetaryForm, description: e.target.value})}
                placeholder="e.g., Save for vacation, Pay off debt"
                required
              />
              <button
                type="button"
                onClick={() => startListening('monetary')}
                className="btn btn-secondary"
                disabled={isListening}
                title="Voice input"
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-input"
                value={monetaryForm.amount}
                onChange={(e) => setMonetaryForm({...monetaryForm, amount: e.target.value})}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-input"
                value={monetaryForm.deadline}
                onChange={(e) => setMonetaryForm({...monetaryForm, deadline: e.target.value})}
              />
            </div>
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Goal'}
          </button>
        </form>
      </div>

      {aiSuggestions.monetary && (
        <div className="card">
          <h4>💡 Financial Tips</h4>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--light-color)', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap'
          }}>
            {aiSuggestions.monetary}
          </div>
        </div>
      )}

      <div className="card">
        <h4>Your Financial Goals</h4>
        {monetaryGoals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No financial goals yet
          </p>
        ) : (
          monetaryGoals.map(goal => (
            <div key={goal.id} className="goal-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              marginBottom: '0.5rem',
              backgroundColor: goal.completed ? 'var(--success-color)' : 'white'
            }}>
              <button
                onClick={() => toggleMonetaryGoal(goal.id, goal.completed)}
                className="btn-icon"
                style={{ color: goal.completed ? 'white' : 'var(--primary-color)' }}
              >
                {goal.completed ? <Check size={20} /> : <Square size={20} />}
              </button>
              <div style={{ flex: 1 }}>
                <h5 style={{ 
                  textDecoration: goal.completed ? 'line-through' : 'none',
                  color: goal.completed ? 'white' : 'var(--text-color)'
                }}>
                  {goal.description}
                </h5>
                {goal.amount > 0 && (
                  <p style={{ 
                    color: goal.completed ? 'white' : 'var(--secondary-color)',
                    fontSize: '0.9rem'
                  }}>
                    ${goal.amount.toLocaleString()}
                  </p>
                )}
                {goal.deadline && (
                  <p style={{ 
                    color: goal.completed ? 'white' : 'var(--secondary-color)',
                    fontSize: '0.9rem'
                  }}>
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderGoalsTab = () => (
    <div className="tab-content">
      <div className="card">
        <h3>General Goals</h3>
        <form onSubmit={addGeneralGoal}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={goalsForm.category}
              onChange={(e) => setGoalsForm({...goalsForm, category: e.target.value})}
              required
            >
              <option value="">Select category</option>
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="learning">Learning</option>
              <option value="health">Health</option>
              <option value="relationships">Relationships</option>
              <option value="hobbies">Hobbies</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Goal Description</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={goalsForm.description}
                onChange={(e) => setGoalsForm({...goalsForm, description: e.target.value})}
                placeholder="Describe your goal"
                required
              />
              <button
                type="button"
                onClick={() => startListening('goals')}
                className="btn btn-secondary"
                disabled={isListening}
                title="Voice input"
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Progress ({goalsForm.progress}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={goalsForm.progress}
              onChange={(e) => setGoalsForm({...goalsForm, progress: parseInt(e.target.value)})}
              className="form-input"
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Goal'}
          </button>
        </form>
      </div>

      <div className="card">
        <h4>Your Goals</h4>
        {generalGoals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No goals yet
          </p>
        ) : (
          generalGoals.map(goal => (
            <div key={goal.id} className="goal-item" style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h5>{goal.description}</h5>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {goal.category}
                </span>
              </div>
              
              <div className="progress-bar" style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--light-color)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: `${goal.progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--success-color)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                  Progress: {goal.progress}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                  style={{ width: '100px' }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderWorkoutsTab = () => (
    <div className="tab-content">
      <div className="card">
        <h3>Workouts & Nutrition</h3>
        <form onSubmit={addWorkout}>
          <div className="form-group">
            <label className="form-label">Workout Type</label>
            <select
              className="form-input"
              value={workoutForm.type}
              onChange={(e) => setWorkoutForm({...workoutForm, type: e.target.value})}
              required
            >
              <option value="">Select type</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength Training</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="yoga">Yoga</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={workoutForm.description}
                onChange={(e) => setWorkoutForm({...workoutForm, description: e.target.value})}
                placeholder="e.g., 30 min run, Upper body workout"
                required
              />
              <button
                type="button"
                onClick={() => startListening('workout')}
                className="btn btn-secondary"
                disabled={isListening}
                title="Voice input"
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                className="form-input"
                value={workoutForm.duration}
                onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                placeholder="e.g., 30 min"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nutrition Notes</label>
              <input
                type="text"
                className="form-input"
                value={workoutForm.nutrition}
                onChange={(e) => setWorkoutForm({...workoutForm, nutrition: e.target.value})}
                placeholder="e.g., Protein shake after"
              />
            </div>
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Workout'}
          </button>
        </form>
      </div>

      {aiSuggestions.workout && (
        <div className="card">
          <h4>💪 Fitness & Nutrition Tips</h4>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--light-color)', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap'
          }}>
            {aiSuggestions.workout}
          </div>
        </div>
      )}

      <div className="card">
        <h4>Your Workouts</h4>
        {workouts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No workouts logged yet
          </p>
        ) : (
          workouts.map(workout => (
            <div key={workout.id} className="workout-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              marginBottom: '0.5rem',
              backgroundColor: workout.completed ? 'var(--success-color)' : 'white'
            }}>
              <button
                onClick={() => toggleWorkout(workout.id, workout.completed)}
                className="btn-icon"
                style={{ color: workout.completed ? 'white' : 'var(--primary-color)' }}
              >
                {workout.completed ? <Check size={20} /> : <Square size={20} />}
              </button>
              <div style={{ flex: 1 }}>
                <h5 style={{ 
                  textDecoration: workout.completed ? 'line-through' : 'none',
                  color: workout.completed ? 'white' : 'var(--text-color)'
                }}>
                  {workout.description}
                </h5>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.9rem',
                  color: workout.completed ? 'white' : 'var(--secondary-color)'
                }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: workout.completed ? 'rgba(255,255,255,0.2)' : 'var(--light-color)',
                    borderRadius: '4px'
                  }}>
                    {workout.type}
                  </span>
                  {workout.duration && <span>⏱️ {workout.duration}</span>}
                  {workout.nutrition && <span>🍎 {workout.nutrition}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderSpiritualTab = () => (
    <div className="tab-content">
      <div className="card">
        <h3>Spiritual Growth</h3>
        <form onSubmit={addSpiritualNote}>
          <div className="form-group">
            <label className="form-label">Reflection</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                className="form-textarea"
                value={spiritualForm.reflection}
                onChange={(e) => setSpiritualForm({...spiritualForm, reflection: e.target.value})}
                placeholder="What's on your heart today?"
                rows={3}
                required
              />
              <button
                type="button"
                onClick={() => startListening('spiritual')}
                className="btn btn-secondary"
                disabled={isListening}
                title="Voice input"
                style={{ alignSelf: 'flex-start' }}
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Gratitude</label>
              <textarea
                className="form-textarea"
                value={spiritualForm.gratitude}
                onChange={(e) => setSpiritualForm({...spiritualForm, gratitude: e.target.value})}
                placeholder="What are you thankful for?"
                rows={2}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prayer</label>
              <textarea
                className="form-textarea"
                value={spiritualForm.prayer}
                onChange={(e) => setSpiritualForm({...spiritualForm, prayer: e.target.value})}
                placeholder="Prayer requests or thoughts"
                rows={2}
              />
            </div>
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      </div>

      {aiSuggestions.spiritual && (
        <div className="card">
          <h4>🙏 Spiritual Guidance</h4>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--light-color)', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap'
          }}>
            {aiSuggestions.spiritual}
          </div>
        </div>
      )}

      <div className="card">
        <h4>Your Spiritual Journey</h4>
        {spiritualNotes.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No spiritual notes yet
          </p>
        ) : (
          spiritualNotes.map(note => (
            <div key={note.id} className="spiritual-note" style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h5>Reflection</h5>
                <p style={{ whiteSpace: 'pre-wrap' }}>{note.reflection}</p>
              </div>
              
              {(note.gratitude || note.prayer) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {note.gratitude && (
                    <div>
                      <h6>🙏 Gratitude</h6>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{note.gratitude}</p>
                    </div>
                  )}
                  {note.prayer && (
                    <div>
                      <h6>💝 Prayer</h6>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{note.prayer}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div style={{ 
                marginTop: '1rem', 
                fontSize: '0.8rem', 
                color: 'var(--secondary-color)',
                textAlign: 'right'
              }}>
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="off-days-container">
      {!isOnline && (
        <div className="offline-alert" style={{
          backgroundColor: 'var(--warning-color)',
          color: 'white',
          padding: '0.75rem',
          textAlign: 'center',
          marginBottom: '1rem',
          borderRadius: '8px'
        }}>
          ⚠️ You're offline. Some features may not work.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`} style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          backgroundColor: message.type === 'success' ? 'var(--success-color)' : 'var(--error-color)',
          color: 'white'
        }}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Off-Days Management</h2>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Manage your personal goals, fitness, and spiritual growth during your days off.
        </p>
      </div>

      <div className="tab-navigation" style={{
        display: 'flex',
        background: '#007BFF',
        borderRadius: '12px',
        padding: '0.5rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        gap: '0.5rem'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem'
            }}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'monetary' && renderMonetaryTab()}
      {activeTab === 'goals' && renderGoalsTab()}
      {activeTab === 'workouts' && renderWorkoutsTab()}
      {activeTab === 'spiritual' && renderSpiritualTab()}
      {activeTab === 'tracker' && (
        <React.Suspense fallback={<div>Loading Goal Tracker...</div>}>
          <GoalTracker />
        </React.Suspense>
      )}

      {isListening && (
        <div className="voice-indicator" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--warning-color)',
          color: 'white',
          padding: '1rem',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'pulse 1s infinite'
        }}>
          <Mic size={24} />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .tab-navigation {
            flex-wrap: wrap;
          }
          
          .tab-button {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}

export default OffDays 