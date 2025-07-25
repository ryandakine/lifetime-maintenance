import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Brain,
  AlertCircle,
  Clock,
  Calendar,
  Star,
  RotateCcw,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader,
  HelpCircle,
  Send,
  Thermometer,
  Droplets,
  Zap,
  Hammer,
  Sparkles,
  Palette,
  TreePine,
  Settings,
  Shield,
  Wrench,
  AlertTriangle,
  Lightbulb,
  Info,
  ClipboardList,
  FileText,
  Mic,
  Keyboard,
  MicOff,
  Circle,
  X,
  Edit,
  Save,
  TrendingUp,
  Target
} from 'lucide-react'

// Memoized Task Item Component
const TaskItem = React.memo(({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit, 
  onSaveEdit, 
  editingId, 
  editText, 
  setEditText,
  isMobile 
}) => {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b', 
    low: '#10b981'
  }

  const priorityIcons = {
    high: <AlertTriangle size={16} />,
    medium: <Clock size={16} />,
    low: <Circle size={16} />
  }

  const isEditing = editingId === task.id

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: task.checked ? '#f8f9fa' : 'white',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      opacity: task.checked ? 0.7 : 1,
      transition: 'all 0.2s ease'
    }}>
      {/* Priority Indicator */}
      <div style={{
        color: priorityColors[task.priority] || '#6c757d',
        display: 'flex',
        alignItems: 'center'
      }}>
        {priorityIcons[task.priority] || <Circle size={16} />}
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: task.checked ? '#10b981' : '#6c757d',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {task.checked ? <CheckCircle size={20} /> : <Circle size={20} />}
      </button>

      {/* Task Content */}
      <div style={{ flex: 1 }}>
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #007bff',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            autoFocus
          />
        ) : (
          <div>
            <div style={{
              textDecoration: task.checked ? 'line-through' : 'none',
              color: task.checked ? '#6c757d' : '#212529',
              fontSize: '1rem',
              fontWeight: '500',
              marginBottom: '0.25rem'
            }}>
              {task.description}
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.8rem',
              color: '#6c757d',
              flexWrap: 'wrap'
            }}>
              <span style={{
                backgroundColor: priorityColors[task.priority] || '#6c757d',
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                textTransform: 'uppercase'
              }}>
                {task.priority}
              </span>
              {task.category && (
                <span style={{
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
                }}>
                  {task.category}
                </span>
              )}
              {task.daysElapsed > 0 && (
                <span style={{
                  backgroundColor: task.daysElapsed > 7 ? '#fff3cd' : '#d1ecf1',
                  color: task.daysElapsed > 7 ? '#856404' : '#0c5460',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem'
                }}>
                  {task.daysElapsed} day{task.daysElapsed !== 1 ? 's' : ''} old
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        opacity: isEditing ? 0 : 1,
        transition: 'opacity 0.2s ease'
      }}>
        {isEditing ? (
          <>
            <button
              onClick={() => onSaveEdit(task.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#10b981',
                padding: '0.25rem'
              }}
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => onEdit(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '0.25rem'
              }}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(task.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#007bff',
                padding: '0.25rem'
              }}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#dc3545',
                padding: '0.25rem'
              }}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
})

TaskItem.displayName = 'TaskItem'

// Memoized Task Template Component
const TaskTemplate = React.memo(({ template, onApply, isMobile }) => {
  return (
    <button
      onClick={() => onApply(template)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: isMobile ? '120px' : '150px',
        textAlign: 'center'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)'
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)'
        e.target.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '2rem' }}>{template.icon}</div>
      <div style={{ fontWeight: '600', color: '#212529' }}>{template.name}</div>
      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{template.description}</div>
    </button>
  )
})

TaskTemplate.displayName = 'TaskTemplate'

const Tasks = forwardRef((props, ref) => {
  console.log('Rendering Tasks')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [userInput, setUserInput] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // New state for smart task parsing
  const [conversationMode, setConversationMode] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [clarifyingQuestions, setClarifyingQuestions] = useState([])
  const [taskDetails, setTaskDetails] = useState({})
  const [conversationHistory, setConversationHistory] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [taskCategories, setTaskCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [listeningTimeout, setListeningTimeout] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [taskInsights, setTaskInsights] = useState({})
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [workloadAnalysis, setWorkloadAnalysis] = useState({})
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceModalText, setVoiceModalText] = useState('')
  const [voiceModalListening, setVoiceModalListening] = useState(false)
  const [voiceModalRecognitionRef, setVoiceModalRecognitionRef] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState('all')

  // Expose methods to parent component (for voice assistant)
  useImperativeHandle(ref, () => ({
    setUserInput: (input) => setUserInput(input),
    processUserInput: () => processUserInput(),
    addTask: (taskData) => {
      setUserInput(taskData.task)
      processUserInput()
    }
  }))

  // Task Templates for Quick Actions
  const taskTemplates = {
    HVAC: [
      { name: 'Check HVAC filters', description: 'Inspect and replace HVAC air filters', priority: 2, time: 30, complexity: 'low' },
      { name: 'Clean HVAC vents', description: 'Clean and dust HVAC vents and registers', priority: 2, time: 60, complexity: 'low' },
      { name: 'Test thermostat', description: 'Test thermostat functionality and calibration', priority: 1, time: 45, complexity: 'medium' },
      { name: 'HVAC maintenance', description: 'Schedule professional HVAC maintenance', priority: 2, time: 120, complexity: 'medium' },
      { name: 'Fix HVAC unit', description: 'Repair HVAC unit issues', priority: 1, time: 180, complexity: 'high' }
    ],
    Plumbing: [
      { name: 'Fix leaky faucet', description: 'Repair or replace leaky faucet', priority: 1, time: 90, complexity: 'medium' },
      { name: 'Unclog drain', description: 'Clear clogged drain or pipe', priority: 1, time: 60, complexity: 'medium' },
      { name: 'Replace toilet parts', description: 'Replace toilet flapper, handle, or other parts', priority: 2, time: 45, complexity: 'low' },
      { name: 'Fix running toilet', description: 'Repair toilet that keeps running', priority: 1, time: 30, complexity: 'low' },
      { name: 'Check water pressure', description: 'Test and adjust water pressure', priority: 2, time: 30, complexity: 'low' }
    ],
    Electrical: [
      { name: 'Replace light bulb', description: 'Replace burned out light bulbs', priority: 2, time: 15, complexity: 'low' },
      { name: 'Fix outlet', description: 'Repair or replace electrical outlet', priority: 1, time: 60, complexity: 'medium' },
      { name: 'Test circuit breaker', description: 'Test and reset circuit breakers', priority: 1, time: 30, complexity: 'low' },
      { name: 'Install light fixture', description: 'Install new light fixture', priority: 2, time: 120, complexity: 'medium' },
      { name: 'Check electrical panel', description: 'Inspect electrical panel for issues', priority: 1, time: 45, complexity: 'medium' }
    ],
    SpecialProject: [
      { name: 'Remodel Locker Room', description: 'Full remodel of the locker room area', priority: 1, time: 1440, complexity: 'high' },
      { name: 'Install New Equipment', description: 'Install and set up new gym equipment', priority: 2, time: 240, complexity: 'medium' },
      { name: 'Renovate Office', description: 'Renovate and update office space', priority: 2, time: 480, complexity: 'high' },
      { name: 'Paint Facility Exterior', description: 'Paint the exterior of the facility', priority: 3, time: 720, complexity: 'medium' }
    ]
  }

  // Quick Actions for very common tasks
  const quickActions = [
    { name: 'Fix leak', description: 'Fix water leak', category: 'Plumbing', priority: 1, time: 60, complexity: 'medium' },
    { name: 'Replace bulb', description: 'Replace light bulb', category: 'Electrical', priority: 2, time: 15, complexity: 'low' },
    { name: 'Unclog drain', description: 'Unclog drain', category: 'Plumbing', priority: 1, time: 60, complexity: 'medium' },
    { name: 'Check equipment', description: 'Check equipment', category: 'Equipment', priority: 2, time: 30, complexity: 'low' }
  ]

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

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [])

  // Handle voice commands
  useEffect(() => {
    const voiceTask = localStorage.getItem('voiceTask')
    if (voiceTask) {
      setUserInput(voiceTask)
      localStorage.removeItem('voiceTask')
      // Auto-process the voice task
      setTimeout(() => {
        processUserInput()
      }, 500)
    }
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
        // Use Supabase if properly configured
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', 'current-user')
          .order('priority', { ascending: true })
          .order('created_at', { ascending: true }) // Oldest first

      if (error) throw error
      setTasks(data || [])
        console.log('Tasks loaded from Supabase:', data?.length || 0)
      } else {
        // Fallback to localStorage
        const localTasks = JSON.parse(localStorage.getItem('localTasks') || '[]')
        // Sort by priority first, then by age (oldest first)
        const sortedTasks = localTasks.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          return new Date(a.created_at) - new Date(b.created_at)
        })
        setTasks(sortedTasks)
        console.log('Tasks loaded from localStorage:', sortedTasks.length)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      console.log('Tasks component: Data load failed, showing fallback')
      showMessage('error', 'Failed to load tasks')
      setTasks([]) // Ensure empty state for fallback
    } finally {
      setLoading(false)
    }
  }

  // Smart task parsing functions
  const analyzeTaskInput = (input) => {
    // First, detect if there are multiple tasks in the input
    const taskSeparators = [
      ' and ',
      ' also ',
      ' plus ',
      ' furthermore ',
      ' additionally ',
      ' moreover ',
      ' as well as ',
      ' along with ',
      ' in addition ',
      ' besides ',
      ' not to mention ',
      ' on top of that ',
      ' furthermore ',
      ' what\'s more ',
      ' to add ',
      ' to include '
    ]
    
    let tasks = [input] // Default to single task
    
    // Check if input contains task separators
    for (const separator of taskSeparators) {
      if (input.toLowerCase().includes(separator.toLowerCase())) {
        // Split on the separator and clean up each part
        tasks = input.split(new RegExp(separator, 'gi'))
          .map(task => task.trim())
          .filter(task => task.length > 0)
        break
      }
    }
    
    // If we found multiple tasks, return an array of analyses
    if (tasks.length > 1) {
      return tasks.map(task => analyzeSingleTask(task))
    }
    
    // Otherwise, analyze as a single task
    return analyzeSingleTask(input)
  }

  const analyzeSingleTask = (input) => {
    const analysis = {
      taskDescription: '',
      priority: null,
      timing: null,
      weekOfMonth: null,
      dayOfWeek: null,
      timeOfDay: null,
      category: null,
      estimatedTime: null,
      dependencies: [],
      complexity: null,
      needsClarification: false,
      questions: []
    }

    const lowerInput = input.toLowerCase()
    
    // Extract task description (remove timing/priority words)
    let description = input
    const timingWords = ['today', 'tomorrow', 'this week', 'next week', 'this month', 'next month', 'urgent', 'asap', 'immediate', 'soon', 'eventually', 'high priority', 'low priority', 'medium priority']
    timingWords.forEach(word => {
      description = description.replace(new RegExp(word, 'gi'), '').trim()
    })
    analysis.taskDescription = description

    // Auto-categorize tasks based on keywords
    if (lowerInput.includes('hvac') || lowerInput.includes('air') || lowerInput.includes('heating') || lowerInput.includes('cooling') || lowerInput.includes('thermostat')) {
      analysis.category = 'HVAC'
    } else if (lowerInput.includes('plumbing') || lowerInput.includes('pipe') || lowerInput.includes('toilet') || lowerInput.includes('sink') || lowerInput.includes('drain') || lowerInput.includes('faucet')) {
      analysis.category = 'Plumbing'
    } else if (lowerInput.includes('electrical') || lowerInput.includes('outlet') || lowerInput.includes('switch') || lowerInput.includes('light') || lowerInput.includes('breaker') || lowerInput.includes('wiring')) {
      analysis.category = 'Electrical'
    } else if (lowerInput.includes('carpentry') || lowerInput.includes('wood') || lowerInput.includes('door') || lowerInput.includes('cabinet') || lowerInput.includes('shelf') || lowerInput.includes('trim')) {
      analysis.category = 'Carpentry'
    } else if (lowerInput.includes('cleaning') || lowerInput.includes('clean') || lowerInput.includes('dust') || lowerInput.includes('vacuum') || lowerInput.includes('wipe')) {
      analysis.category = 'Cleaning'
    } else if (lowerInput.includes('painting') || lowerInput.includes('paint') || lowerInput.includes('touch up') || lowerInput.includes('color')) {
      analysis.category = 'Painting'
    } else if (lowerInput.includes('landscaping') || lowerInput.includes('yard') || lowerInput.includes('garden') || lowerInput.includes('plant') || lowerInput.includes('grass') || lowerInput.includes('tree')) {
      analysis.category = 'Landscaping'
    } else if (lowerInput.includes('equipment') || lowerInput.includes('machine') || lowerInput.includes('treadmill') || lowerInput.includes('bike') || lowerInput.includes('weight') || lowerInput.includes('fitness')) {
      analysis.category = 'Equipment'
    } else if (lowerInput.includes('safety') || lowerInput.includes('emergency') || lowerInput.includes('fire') || lowerInput.includes('alarm') || lowerInput.includes('exit') || lowerInput.includes('security')) {
      analysis.category = 'Safety'
    } else {
      analysis.category = 'General'
    }

    // Estimate time based on task complexity
    if (lowerInput.includes('quick') || lowerInput.includes('simple') || lowerInput.includes('minor') || lowerInput.includes('small')) {
      analysis.estimatedTime = 30 // 30 minutes
      analysis.complexity = 'low'
    } else if (lowerInput.includes('major') || lowerInput.includes('big') || lowerInput.includes('complex') || lowerInput.includes('extensive') || lowerInput.includes('complete')) {
      analysis.estimatedTime = 240 // 4 hours
      analysis.complexity = 'high'
    } else if (lowerInput.includes('replace') || lowerInput.includes('install') || lowerInput.includes('repair')) {
      analysis.estimatedTime = 120 // 2 hours
      analysis.complexity = 'medium'
    } else {
      analysis.estimatedTime = 60 // 1 hour default
      analysis.complexity = 'medium'
    }

    // Detect dependencies
    if (lowerInput.includes('after') || lowerInput.includes('once') || lowerInput.includes('when') || lowerInput.includes('then')) {
      analysis.dependencies = ['other_task'] // Placeholder for dependency detection
    }

    // Detect priority
    if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('immediate') || lowerInput.includes('critical') || lowerInput.includes('emergency') || lowerInput.includes('high priority')) {
      analysis.priority = 1
    } else if (lowerInput.includes('important') || lowerInput.includes('need to') || lowerInput.includes('should') || lowerInput.includes('medium priority')) {
      analysis.priority = 2
    } else if (lowerInput.includes('eventually') || lowerInput.includes('when possible') || lowerInput.includes('low priority')) {
      analysis.priority = 3
    }

    // Detect timing (for immediate tasks)
    if (lowerInput.includes('today') || lowerInput.includes('tomorrow')) {
      analysis.timing = lowerInput.includes('today') ? 'today' : 'tomorrow'
    } else if (lowerInput.includes('this week') || lowerInput.includes('next week')) {
      analysis.timing = lowerInput.includes('this week') ? 'this_week' : 'next_week'
    } else if (lowerInput.includes('this month') || lowerInput.includes('next month')) {
      analysis.timing = lowerInput.includes('this month') ? 'this_month' : 'next_month'
    }

    // Detect specific timing details
    if (lowerInput.includes('morning') || lowerInput.includes('am')) {
      analysis.timeOfDay = 'morning'
    } else if (lowerInput.includes('afternoon') || lowerInput.includes('pm')) {
      analysis.timeOfDay = 'afternoon'
    } else if (lowerInput.includes('evening') || lowerInput.includes('night')) {
      analysis.timeOfDay = 'evening'
    }

    // Detect day of week
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    days.forEach(day => {
      if (lowerInput.includes(day)) {
        analysis.dayOfWeek = day
      }
    })

    // Detect week of month
    if (lowerInput.includes('first week') || lowerInput.includes('1st week')) {
      analysis.weekOfMonth = 1
    } else if (lowerInput.includes('second week') || lowerInput.includes('2nd week')) {
      analysis.weekOfMonth = 2
    } else if (lowerInput.includes('third week') || lowerInput.includes('3rd week')) {
      analysis.weekOfMonth = 3
    } else if (lowerInput.includes('fourth week') || lowerInput.includes('4th week')) {
      analysis.weekOfMonth = 4
    }

    // Generate clarifying questions (removed frequency questions)
    if (!analysis.priority) {
      analysis.questions.push('What is the priority level for this task? (High/Medium/Low)')
      analysis.needsClarification = true
    }

    if (analysis.timing === 'today' && !analysis.timeOfDay) {
      analysis.questions.push('What time of day should this be done? (Morning/Afternoon/Evening)')
      analysis.needsClarification = true
    }

    if (analysis.timing === 'this_week' && !analysis.dayOfWeek) {
      analysis.questions.push('Which day of the week should this be done?')
      analysis.needsClarification = true
    }

    if (analysis.timing === 'this_month' && !analysis.weekOfMonth) {
      analysis.questions.push('Which week of the month should this be done? (1st/2nd/3rd/4th week)')
      analysis.needsClarification = true
    }

    return analysis
  }

  const generateClarifyingQuestions = (analysis) => {
    const questions = []
    
    if (!analysis.priority) {
      questions.push({
        id: 'priority',
        question: 'What is the priority level for this task?',
        type: 'select',
        options: [
          { value: 1, label: 'High Priority (Daily/Urgent)' },
          { value: 2, label: 'Medium Priority (Weekly/Important)' },
          { value: 3, label: 'Low Priority (Monthly/When possible)' }
        ]
      })
    }

    if (analysis.timing === 'today' && !analysis.timeOfDay) {
      questions.push({
        id: 'timeOfDay',
        question: 'What time of day should this be done?',
        type: 'select',
        options: [
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
          { value: 'evening', label: 'Evening' },
          { value: 'anytime', label: 'Anytime' }
        ]
      })
    }

    if (analysis.timing === 'this_week' && !analysis.dayOfWeek) {
      questions.push({
        id: 'dayOfWeek',
        question: 'Which day of the week should this be done?',
        type: 'select',
        options: [
          { value: 'monday', label: 'Monday' },
          { value: 'tuesday', label: 'Tuesday' },
          { value: 'wednesday', label: 'Wednesday' },
          { value: 'thursday', label: 'Thursday' },
          { value: 'friday', label: 'Friday' },
          { value: 'saturday', label: 'Saturday' },
          { value: 'sunday', label: 'Sunday' },
          { value: 'anyday', label: 'Any day' }
        ]
      })
    }

    if (analysis.timing === 'this_month' && !analysis.weekOfMonth) {
      questions.push({
        id: 'weekOfMonth',
        question: 'Which week of the month should this be done?',
        type: 'select',
        options: [
          { value: 1, label: '1st week of the month' },
          { value: 2, label: '2nd week of the month' },
          { value: 3, label: '3rd week of the month' },
          { value: 4, label: '4th week of the month' },
          { value: 0, label: 'Any week' }
        ]
      })
    }

    return questions
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Daily'
      case 2: return 'Weekly'
      case 3: return 'Monthly'
      default: return 'Weekly'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'var(--danger-color)' // Red for daily/high
      case 2: return 'var(--warning-color)' // Yellow for weekly/medium
      case 3: return 'var(--success-color)' // Green for monthly/low
      default: return 'var(--warning-color)'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 1: return <AlertCircle size={14} aria-hidden="true" />
      case 2: return <Clock size={14} aria-hidden="true" />
      case 3: return <Calendar size={14} aria-hidden="true" />
      default: return <Clock size={14} aria-hidden="true" />
    }
  }

  const getPriorityDescription = (priority) => {
    switch (priority) {
      case 1: return 'High Priority - Do Today'
      case 2: return 'Medium Priority - This Week'
      case 3: return 'Low Priority - When Possible'
      default: return 'Medium Priority'
    }
  }

  const getDaysElapsed = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTaskAgeText = (createdAt) => {
    const days = getDaysElapsed(createdAt)
    if (days === 0) return 'Created today'
    if (days === 1) return 'Created yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) {
      const weeks = Math.floor(days / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    }
    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }

  const generateSmartSuggestions = () => {
    const suggestions = []
    
    // Analyze task patterns
    const highPriorityTasks = tasks.filter(task => task.priority === 1)
    const oldTasks = tasks.filter(task => getDaysElapsed(task.created_at) > 7)
    const completedToday = tasks.filter(task => 
      task.status === 'completed' && 
      getDaysElapsed(task.created_at) === 0
    )
    
    // Suggest based on patterns
    if (highPriorityTasks.length > 3) {
      suggestions.push({
        type: 'warning',
        message: `You have ${highPriorityTasks.length} high-priority tasks. Consider delegating some or adjusting priorities.`,
        action: 'review_priorities'
      })
    }
    
    if (oldTasks.length > 5) {
      suggestions.push({
        type: 'urgent',
        message: `You have ${oldTasks.length} tasks older than a week. Focus on completing the oldest ones first.`,
        action: 'focus_old_tasks'
      })
    }
    
    if (completedToday.length === 0) {
      suggestions.push({
        type: 'info',
        message: 'No tasks completed today. Start with a quick win to build momentum!',
        action: 'suggest_quick_tasks'
      })
    }
    
    // Suggest based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      suggestions.push({
        type: 'tip',
        message: 'Morning is perfect for complex tasks. Tackle your most challenging work now.',
        action: 'morning_optimization'
      })
    } else if (hour > 16) {
      suggestions.push({
        type: 'tip',
        message: 'End of day approaching. Focus on quick wins and preparation for tomorrow.',
        action: 'evening_optimization'
      })
    }
    
    return suggestions
  }

  const generateTaskInsights = () => {
    const completedTasks = tasks.filter(task => task.completed)
    const pendingTasks = tasks.filter(task => !task.completed)
    
    // Calculate completion rate
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0
    
    // Average completion time
    let avgCompletionTime = 0
    if (completedTasks.length > 0) {
      const completionTimes = completedTasks.map(task => {
        const created = new Date(task.created_at)
        const completed = new Date(task.completed_at || task.updated_at)
        return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) // days
      })
      avgCompletionTime = (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
    }
    
    // Category breakdown
    const categoryStats = {}
    tasks.forEach(task => {
      const category = task.category || 'Misc'
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, pending: 0 }
      }
      categoryStats[category].total++
      if (task.completed) {
        categoryStats[category].completed++
      } else {
        categoryStats[category].pending++
      }
    })
    
    // Priority distribution
    const priorityStats = { 1: 0, 2: 0, 3: 0 }
    tasks.forEach(task => {
      const priority = task.priority || 2
      priorityStats[priority]++
    })
    
    // Workload analysis
    const highPriorityPending = pendingTasks.filter(task => task.priority === 1).length
    const mediumPriorityPending = pendingTasks.filter(task => task.priority === 2).length
    const lowPriorityPending = pendingTasks.filter(task => task.priority === 3).length
    
    return {
      completionRate,
      avgCompletionTime,
      categoryStats,
      priorityStats,
      workloadAnalysis: {
        highPriority: highPriorityPending,
        mediumPriority: mediumPriorityPending,
        lowPriority: lowPriorityPending,
        totalPending: pendingTasks.length
      }
    }
  }

  const generateAiSuggestions = async () => {
    try {
      const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY
      if (!perplexityApiKey) {
        console.log('Perplexity API key not configured')
        return
      }

      const taskSummary = tasks.map(task => ({
        name: task.task,
        priority: task.priority,
        category: task.category,
        completed: task.completed,
        created_at: task.created_at,
        complexity: task.complexity,
        time_estimate: task.time_estimate
      }))

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
              content: `Analyze this maintenance task list and provide 3-5 smart suggestions for improving productivity and task management. Focus on prioritization, time management, and efficiency. Return as JSON array with 'suggestion' and 'reason' fields. Tasks: ${JSON.stringify(taskSummary)}`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const messageContent = data.choices[0].message.content
        const suggestions = JSON.parse(messageContent)
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HVAC': return <Thermometer size={16} />
      case 'Plumbing': return <Droplets size={16} />
      case 'Electrical': return <Zap size={16} />
      case 'Carpentry': return <Hammer size={16} />
      case 'Cleaning': return <Sparkles size={16} />
      case 'Painting': return <Palette size={16} />
      case 'Landscaping': return <TreePine size={16} />
      case 'Equipment': return <Settings size={16} />
      case 'Safety': return <Shield size={16} />
      default: return <Wrench size={16} />
    }
  }

  const getTimeEstimateText = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'var(--success-color)'
      case 'medium': return 'var(--warning-color)'
      case 'high': return 'var(--danger-color)'
      default: return 'var(--secondary-color)'
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setUserInput(template.description)
    setShowTemplates(false)
    // Auto-analyze the template
    const analysis = analyzeSingleTask(template.description)
    analysis.priority = template.priority
    analysis.category = template.category
    analysis.estimatedTime = template.time
    analysis.complexity = template.complexity
    
    if (analysis.needsClarification) {
      setConversationMode(true)
      setCurrentTask({
        type: 'single',
        description: template.description,
        priority: template.priority,
        timing: analysis.timing,
        weekOfMonth: analysis.weekOfMonth,
        dayOfWeek: analysis.dayOfWeek,
        timeOfDay: analysis.timeOfDay,
        category: template.category,
        estimatedTime: template.time,
        complexity: template.complexity
      })
      setClarifyingQuestions(generateClarifyingQuestions(analysis))
      setConversationHistory([{
        type: 'system',
        message: `I've selected the template: "${template.name}". Let me ask a few questions to customize it for you.`
      }])
    } else {
      // Save directly if no clarification needed
      saveSingleTask({
        task: template.description,
        priority: template.priority,
        timing: analysis.timing,
        weekOfMonth: analysis.weekOfMonth,
        dayOfWeek: analysis.dayOfWeek,
        timeOfDay: analysis.timeOfDay,
        category: template.category,
        estimatedTime: template.time,
        complexity: template.complexity
      })
    }
  }

  const handleQuickAction = (action) => {
    const analysis = analyzeSingleTask(action.description)
    analysis.priority = action.priority
    analysis.category = action.category
    analysis.estimatedTime = action.time
    analysis.complexity = action.complexity
    
    saveSingleTask({
      task: action.description,
      priority: action.priority,
      timing: analysis.timing,
      weekOfMonth: analysis.weekOfMonth,
      dayOfWeek: analysis.dayOfWeek,
      timeOfDay: analysis.timeOfDay,
      category: action.category,
      estimatedTime: action.time,
      complexity: action.complexity
    })
    
    showMessage('success', `Quick task added: ${action.name}`)
  }

  const processUserInput = async () => {
    if (!userInput.trim()) return

    try {
      setProcessing(true)
      
      // Analyze the input to understand what the user is saying
      const analysis = analyzeTaskInput(userInput)
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, { type: 'user', content: userInput }])
      
      // Check if we have multiple tasks
      if (Array.isArray(analysis)) {
        // Multiple tasks detected
        const tasksNeedingClarification = analysis.filter(task => task.needsClarification)
        
        if (tasksNeedingClarification.length === 0) {
          // All tasks have complete information, save them all
          for (const taskAnalysis of analysis) {
            const taskData = {
              task: taskAnalysis.taskDescription, // Use the cleaned description
              priority: taskAnalysis.priority || 2,
              frequency: 'daily', // Frequency is no longer tracked
              timing: taskAnalysis.timing,
              weekOfMonth: taskAnalysis.weekOfMonth,
              dayOfWeek: taskAnalysis.dayOfWeek,
              timeOfDay: taskAnalysis.timeOfDay,
              status: 'pending',
              created_at: new Date().toISOString()
            }
            await saveSingleTask(taskData)
          }
          
          const taskNames = analysis.map(task => task.taskDescription).join(', ')
          showMessage('success', `Added ${analysis.length} tasks: ${taskNames}`)
          
      } else {
          // Some tasks need clarification
          setConversationMode(true)
          setCurrentTask({ 
            type: 'multiple',
            tasks: analysis,
            currentTaskIndex: 0,
            tasksNeedingClarification: tasksNeedingClarification
          })
          
          // Show summary of detected tasks
          const taskSummary = analysis.map((task, index) => 
            `${index + 1}. ${task.taskDescription}${task.needsClarification ? ' (needs details)' : ' (complete)'}`
          ).join('\n')
          
          const systemMessage = `I found ${analysis.length} tasks in your input:\n\n${taskSummary}\n\nLet me ask clarifying questions for the tasks that need more details.`
          setConversationHistory(prev => [...prev, { type: 'system', content: systemMessage }])
          
          // Start with the first task that needs clarification
          const firstTaskNeedingClarification = tasksNeedingClarification[0]
          const questions = generateClarifyingQuestions(firstTaskNeedingClarification)
          setClarifyingQuestions(questions)
          setTaskDetails({
            description: firstTaskNeedingClarification.taskDescription, // Use the cleaned description
            priority: firstTaskNeedingClarification.priority,
            timing: firstTaskNeedingClarification.timing,
            weekOfMonth: firstTaskNeedingClarification.weekOfMonth,
            dayOfWeek: firstTaskNeedingClarification.dayOfWeek,
            timeOfDay: firstTaskNeedingClarification.timeOfDay
          })
        }
        
      } else {
        // Single task
        if (analysis.needsClarification) {
          // Enter conversation mode to ask clarifying questions
          setConversationMode(true)
          setCurrentTask({ type: 'single', ...analysis })
          const questions = generateClarifyingQuestions(analysis)
          setClarifyingQuestions(questions)
          setTaskDetails({
            description: analysis.taskDescription,
            priority: analysis.priority,
            timing: analysis.timing,
            weekOfMonth: analysis.weekOfMonth,
            dayOfWeek: analysis.dayOfWeek,
            timeOfDay: analysis.timeOfDay
          })
          
          // Add system message to conversation
          const systemMessage = `I understand you want to add: "${analysis.taskDescription}". Let me ask a few questions to get the details right.`
          setConversationHistory(prev => [...prev, { type: 'system', content: systemMessage }])
          
        } else {
          // We have enough information, create the task directly
          const taskData = {
            task: analysis.taskDescription, // Use the cleaned task description
            priority: analysis.priority || 2,
            frequency: 'daily', // Frequency is no longer tracked
            timing: analysis.timing,
            weekOfMonth: analysis.weekOfMonth,
            dayOfWeek: analysis.dayOfWeek,
            timeOfDay: analysis.timeOfDay,
            status: 'pending',
            created_at: new Date().toISOString()
          }
          
          await saveSingleTask(taskData)
          showMessage('success', `Task "${analysis.taskDescription}" added successfully!`)
        }
      }

    } catch (error) {
      console.error('Error processing input:', error)
      showMessage('error', 'Failed to process input. Please try again.')
    } finally {
      setProcessing(false)
      setUserInput('')
    }
  }

  const handleClarifyingAnswer = async (questionId, answer) => {
    // Update task details with the answer
    setTaskDetails(prev => ({
      ...prev,
      [questionId]: answer
    }))
    
    // Add to conversation history
    setConversationHistory(prev => [...prev, { type: 'user', content: answer }])
    
    // Remove the answered question
    setClarifyingQuestions(prev => prev.filter(q => q.id !== questionId))
    
    // Check if we have all the information we need for the current task
    const updatedDetails = { ...taskDetails, [questionId]: answer }
    const allQuestionsAnswered = clarifyingQuestions.length <= 1 // Only the current question remains
    
    if (allQuestionsAnswered) {
      if (currentTask.type === 'multiple') {
        // Handle multiple tasks
        const currentTaskIndex = currentTask.currentTaskIndex
        const currentTaskData = currentTask.tasksNeedingClarification[currentTaskIndex]
        
        // Update the current task with the answers
        const updatedTask = {
          ...currentTaskData,
          priority: updatedDetails.priority || currentTaskData.priority,
          timing: updatedDetails.timing || currentTaskData.timing,
          weekOfMonth: updatedDetails.weekOfMonth || currentTaskData.weekOfMonth,
          dayOfWeek: updatedDetails.dayOfWeek || currentTaskData.dayOfWeek,
          timeOfDay: updatedDetails.timeOfDay || currentTaskData.timeOfDay
        }
        
        // Update the task in the array
        const updatedTasks = [...currentTask.tasks]
        const originalTaskIndex = currentTask.tasks.findIndex(task => 
          task.taskDescription === currentTaskData.taskDescription
        )
        updatedTasks[originalTaskIndex] = updatedTask
        
        // Check if there are more tasks that need clarification
        const remainingTasksNeedingClarification = updatedTasks.filter(task => {
          const needsPriority = !task.priority
          const needsTimeOfDay = task.timing === 'today' && !task.timeOfDay
          const needsDayOfWeek = task.timing === 'this_week' && !task.dayOfWeek
          const needsWeekOfMonth = task.timing === 'this_month' && !task.weekOfMonth
          
          return needsPriority || needsTimeOfDay || needsDayOfWeek || needsWeekOfMonth
        })
        
        if (remainingTasksNeedingClarification.length === 0) {
          // All tasks are complete, save them all
          for (const task of updatedTasks) {
            const taskData = {
              task: task.taskDescription, // Use the cleaned task description
              priority: task.priority || 2,
              frequency: 'daily', // Frequency is no longer tracked
              timing: task.timing,
              weekOfMonth: task.weekOfMonth,
              dayOfWeek: task.dayOfWeek,
              timeOfDay: task.timeOfDay,
              status: 'pending',
              created_at: new Date().toISOString()
            }
            await saveSingleTask(taskData)
          }
          
          // Exit conversation mode
          setConversationMode(false)
          setCurrentTask(null)
          setClarifyingQuestions([])
          setTaskDetails({})
          setConversationHistory([])
          
          const taskNames = updatedTasks.map(task => task.taskDescription).join(', ')
          showMessage('success', `Added ${updatedTasks.length} tasks: ${taskNames}`)
          
        } else {
          // Move to the next task that needs clarification
          const nextTaskIndex = currentTaskIndex + 1
          const nextTask = remainingTasksNeedingClarification[0]
          
          setCurrentTask({
            ...currentTask,
            tasks: updatedTasks,
            currentTaskIndex: nextTaskIndex,
            tasksNeedingClarification: remainingTasksNeedingClarification
          })
          
          // Generate questions for the next task
          const questions = generateClarifyingQuestions(nextTask)
          setClarifyingQuestions(questions)
          setTaskDetails({
            description: nextTask.taskDescription, // Use the cleaned task description
            priority: nextTask.priority,
            timing: nextTask.timing,
            weekOfMonth: nextTask.weekOfMonth,
            dayOfWeek: nextTask.dayOfWeek,
            timeOfDay: nextTask.timeOfDay
          })
          
          // Add system message for next task
          const systemMessage = `Now let me ask about: "${nextTask.taskDescription}"`
          setConversationHistory(prev => [...prev, { type: 'system', content: systemMessage }])
        }
        
      } else {
        // Single task - create the task with all the details
        const taskData = {
          task: currentTask.taskDescription, // Use the cleaned task description
          priority: updatedDetails.priority || 2,
          frequency: 'daily', // Frequency is no longer tracked
          timing: updatedDetails.timing,
          weekOfMonth: updatedDetails.weekOfMonth,
          dayOfWeek: updatedDetails.dayOfWeek,
          timeOfDay: updatedDetails.timeOfDay,
          status: 'pending',
          created_at: new Date().toISOString()
        }
        
        await saveSingleTask(taskData)
        
        // Exit conversation mode
        setConversationMode(false)
        setCurrentTask(null)
        setClarifyingQuestions([])
        setTaskDetails({})
        setConversationHistory([])
        
        showMessage('success', `Task "${currentTask.taskDescription}" added successfully!`)
      }
    }
  }

  const saveSingleTask = async (taskData) => {
    try {
      const newTask = {
        id: Date.now().toString(),
        task_list: taskData.task, // Use the cleaned task description
        priority: taskData.priority || 2,
        frequency: 'daily', // Frequency is no longer tracked
        timing: taskData.timing,
        week_of_month: taskData.weekOfMonth,
        day_of_week: taskData.dayOfWeek,
        time_of_day: taskData.timeOfDay,
        category: taskData.category || 'General',
        estimated_time: taskData.estimatedTime || 60,
        complexity: taskData.complexity || 'medium',
        dependencies: taskData.dependencies || [],
        status: 'pending',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      }

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
        // Use Supabase if properly configured
        const { error } = await supabase
          .from(TABLES.TASKS)
          .insert([newTask])

        if (error) throw error
        console.log('Task saved to Supabase:', newTask.task_list)
      } else {
        // Fallback to localStorage
        const localTasks = JSON.parse(localStorage.getItem('localTasks') || '[]')
        localTasks.push(newTask)
        localStorage.setItem('localTasks', JSON.stringify(localTasks))
        console.log('Task saved to localStorage:', newTask.task_list)
      }

      await loadTasks()
      showMessage('success', 'Task added successfully!')
    } catch (error) {
      console.error('Error saving task:', error)
      showMessage('error', 'Failed to save task')
    }
  }

  const detectPriorityFromKeywords = (input) => {
    const lowerInput = input.toLowerCase()
    
    // Priority 1 (Daily/High) keywords
    if (lowerInput.includes('today') || lowerInput.includes('urgent') || 
        lowerInput.includes('asap') || lowerInput.includes('immediate') ||
        lowerInput.includes('now') || lowerInput.includes('critical') ||
        lowerInput.includes('emergency')) {
      return 1
    }
    
    // Priority 3 (Monthly/Low) keywords
    if (lowerInput.includes('this month') || lowerInput.includes('eventually') ||
        lowerInput.includes('when possible') || lowerInput.includes('low priority')) {
      return 3
    }
    
    // Default to Priority 2 (Weekly/Medium)
    return 2
  }

  const saveTasksWithPriority = async (tasksWithPriority) => {
    try {
      const tasksToSave = tasksWithPriority.map(taskData => ({
        user_id: 'current-user',
        task_list: taskData.task,
        priority: taskData.priority,
        status: 'pending'
      }))

      const { error } = await supabase
        .from(TABLES.TASKS)
        .insert(tasksToSave)

      if (error) throw error

      console.log(`Tasks saved with priorities:`, tasksWithPriority.map(t => `${t.task} (Priority ${t.priority})`))
      showMessage('success', `${tasksToSave.length} tasks added with priority levels`)
      
      await loadTasks()
    } catch (error) {
      console.error('Error saving tasks:', error)
      showMessage('error', 'Failed to save tasks')
    }
  }

  const saveTasks = async (taskList, priority = 2) => {
    try {
      const tasksToSave = taskList.map(task => ({
        id: crypto.randomUUID(), // Generate local ID
        user_id: 'current-user',
        task_list: task,
        priority: priority,
        status: 'pending',
        created_at: new Date().toISOString()
      }))

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
        // Use Supabase if properly configured
      const { error } = await supabase
        .from(TABLES.TASKS)
        .insert(tasksToSave)

      if (error) throw error
      } else {
        // Fallback to localStorage
        const existingTasks = JSON.parse(localStorage.getItem('localTasks') || '[]')
        const updatedTasks = [...existingTasks, ...tasksToSave]
        localStorage.setItem('localTasks', JSON.stringify(updatedTasks))
        console.log('Tasks saved to localStorage (Supabase not configured)')
      }

      console.log(`Tasks saved with priority ${priority}:`, taskList)
      showMessage('success', `${tasksToSave.length} tasks added`)
      
      await loadTasks()
    } catch (error) {
      console.error('Error saving tasks:', error)
      showMessage('error', 'Failed to save tasks')
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
        // Use Supabase if properly configured
      const { error } = await supabase
        .from(TABLES.TASKS)
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
      } else {
        // Update localStorage
        const localTasks = JSON.parse(localStorage.getItem('localTasks') || '[]')
        const updatedTasks = localTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
        localStorage.setItem('localTasks', JSON.stringify(updatedTasks))
      }

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
      
      console.log(`Task ${taskId} status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating task status:', error)
      showMessage('error', 'Failed to update task status')
    }
  }

  const updateTaskPriority = async (taskId, newPriority) => {
    try {
      const { error } = await supabase
        .from(TABLES.TASKS)
        .update({ priority: newPriority })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ))
      
      console.log(`Task priority set to ${newPriority} (${getPriorityLabel(newPriority)})`)
      showMessage('success', `Priority updated to ${getPriorityLabel(newPriority)}`)
      
      // Re-sort tasks by priority
      await loadTasks()
    } catch (error) {
      console.error('Error updating task priority:', error)
      showMessage('error', 'Failed to update task priority')
    }
  }

  const deleteTask = async (taskId) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
        // Use Supabase if properly configured
      const { error } = await supabase
        .from(TABLES.TASKS)
        .delete()
        .eq('id', taskId)

      if (error) throw error
      } else {
        // Update localStorage
        const localTasks = JSON.parse(localStorage.getItem('localTasks') || '[]')
        const updatedTasks = localTasks.filter(task => task.id !== taskId)
        localStorage.setItem('localTasks', JSON.stringify(updatedTasks))
      }

      setTasks(tasks.filter(task => task.id !== taskId))
      console.log(`Task ${taskId} deleted`)
      showMessage('success', 'Task deleted')
    } catch (error) {
      console.error('Error deleting task:', error)
      showMessage('error', 'Failed to delete task')
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Voice Recognition Functions
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showMessage('error', 'Voice recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      showMessage('info', 'Listening... Speak your task now')
      
      // Auto-stop after 30 seconds to prevent getting stuck
      const timeout = setTimeout(() => {
        if (isListening) {
          stopListening()
          showMessage('warning', 'Voice input timed out. Please try again.')
        }
      }, 30000)
      
      setListeningTimeout(timeout)
    }
    
    recognition.onresult = (event) => {
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
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        showMessage('warning', 'No speech detected. Try again.')
      } else {
        showMessage('error', `Voice recognition error: ${event.error}`)
      }
    }
    
    recognition.onend = () => {
      setIsListening(false)
      if (transcript.trim()) {
        // Check if it's a voice command first
        if (processVoiceCommand(transcript)) {
          setTranscript('')
          showMessage('success', 'Voice command processed! Task added automatically.')
        } else {
          // Regular voice input
          setUserInput(transcript)
          showMessage('success', 'Voice input captured! Click "Add Task" or speak again.')
        }
      }
    }
    
    recognition.start()
  }

  const stopListening = () => {
    // Clear the timeout
    if (listeningTimeout) {
      clearTimeout(listeningTimeout)
      setListeningTimeout(null)
    }
    
    // Stop the recognition
    if (window.speechRecognition) {
      try {
        window.speechRecognition.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
    }
    
    setIsListening(false)
    showMessage('info', 'Voice input stopped.')
  }

  // Voice Commands for Quick Actions
  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    
    // Quick action voice commands
    if (lowerCommand.includes('fix leak') || lowerCommand.includes('leak')) {
      handleQuickAction(quickActions.find(a => a.name === 'Fix leak'))
      return true
    }
    if (lowerCommand.includes('replace bulb') || lowerCommand.includes('light bulb')) {
      handleQuickAction(quickActions.find(a => a.name === 'Replace bulb'))
      return true
    }
    if (lowerCommand.includes('unclog') || lowerCommand.includes('drain')) {
      handleQuickAction(quickActions.find(a => a.name === 'Unclog drain'))
      return true
    }
    if (lowerCommand.includes('clean') || lowerCommand.includes('cleaning')) {
      handleQuickAction(quickActions.find(a => a.name === 'Clean area'))
      return true
    }
    if (lowerCommand.includes('check equipment') || lowerCommand.includes('equipment')) {
      handleQuickAction(quickActions.find(a => a.name === 'Check equipment'))
      return true
    }
    
    return false
  }

  // Voice Modal Functions
  const openVoiceModal = () => {
    setShowVoiceModal(true)
    setVoiceModalText('')
  }

  const closeVoiceModal = () => {
    setShowVoiceModal(false)
    setVoiceModalText('')
    if (voiceModalRecognitionRef) {
      voiceModalRecognitionRef.stop()
      voiceModalRecognitionRef.abort()
    }
  }

  const startVoiceModalListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showMessage('error', 'Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setVoiceModalListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setVoiceModalText(prev => prev + finalTranscript + ' ')
      }
    }

    recognition.onend = () => {
      setVoiceModalListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setVoiceModalListening(false)
    }

    recognition.start()
    setVoiceModalRecognitionRef(recognition)
  }

  const stopVoiceModalListening = () => {
    if (voiceModalRecognitionRef) {
      voiceModalRecognitionRef.stop()
      voiceModalRecognitionRef.abort()
      setVoiceModalListening(false)
    }
  }

  const applyVoiceModalText = () => {
    if (voiceModalText.trim()) {
      setUserInput(voiceModalText.trim())
      closeVoiceModal()
    }
  }

  // Memoized computed values
  const filteredTasks = useMemo(() => {
    let filtered = tasks
    
    if (filter) {
      filtered = filtered.filter(task => {
        if (filter === 'completed') return task.checked
        if (filter === 'pending') return !task.checked
        if (filter === 'high-priority') return task.priority === 'high' && !task.checked
        if (filter === 'overdue') return task.daysElapsed > 7 && !task.checked
        return true
      })
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [tasks, filter])

  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.checked).length
    const pending = total - completed
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.checked).length
    const overdue = tasks.filter(t => t.daysElapsed > 7 && !t.checked).length
    
    return { total, completed, pending, highPriority, overdue }
  }, [tasks])

  const memoizedTaskInsights = useMemo(() => {
    if (tasks.length === 0) return null
    
    const completedTasks = tasks.filter(t => t.checked)
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => sum + (task.daysElapsed || 0), 0) / completedTasks.length 
      : 0
    
    const categoryBreakdown = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    }, {})
    
    const priorityDistribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {})
    
    return {
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0,
      avgCompletionTime: avgCompletionTime.toFixed(1),
      categoryBreakdown,
      priorityDistribution
    }
  }, [tasks])

  // Memoized callback functions
  const handleToggle = useCallback((taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, checked: !task.checked } : task
    ))
  }, [])

  const handleDelete = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  const handleEdit = useCallback((taskId) => {
    setEditingId(taskId)
    if (taskId) {
      const task = tasks.find(t => t.id === taskId)
      setEditText(task?.description || '')
    }
  }, [tasks])

  const handleSaveEdit = useCallback(() => {
    if (editingId && editText.trim()) {
      setTasks(prev => prev.map(task => 
        task.id === editingId ? { ...task, description: editText.trim() } : task
      ))
      setEditingId(null)
      setEditText('')
    }
  }, [editingId, editText])

  const handleTemplateApply = useCallback((template) => {
    const newTask = {
      id: Date.now().toString(),
      description: template.defaultDescription,
      priority: template.defaultPriority,
      category: template.category,
      checked: false,
      createdAt: new Date().toISOString(),
      daysElapsed: 0
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
  }, [])

  return (
    <div className="container">
      {!isOnline && (
        <div className="offline-alert">
          ⚠️ You are currently offline. Some features may not work properly.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Task Input Section */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Add New Task</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Use voice input for fastest task creation, or type manually. The AI will understand and categorize automatically.
        </p>
        
        {/* Voice Input Section */}
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          backgroundColor: isListening ? 'var(--warning-color)' : 'var(--light-color)', 
          borderRadius: '8px',
          border: isListening ? '2px solid var(--warning-color)' : '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <h4 style={{ 
            marginBottom: '0.5rem', 
            color: isListening ? 'white' : 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Mic size={20} />
            Voice Input
          </h4>
          
          {/* Voice Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
              onClick={isListening ? stopListening : startListening}
              style={{
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: 'none',
                backgroundColor: isListening ? '#dc3545' : 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: isListening ? '0 0 20px rgba(220, 53, 69, 0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                animation: isListening ? 'pulse 2s infinite' : 'none'
              }}
            >
              {isListening ? (
                <>
                  <Square size={20} />
                  STOP LISTENING
            </>
          ) : (
            <>
                  <Mic size={20} />
                  Quick Voice
            </>
          )}
        </button>
            
            <button
              onClick={openVoiceModal}
              style={{
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: '2px solid var(--primary-color)',
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <MessageSquare size={20} />
              Voice Modal
            </button>
          </div>
          
          {/* Voice Status */}
          {isListening && (
            <div style={{ 
              color: 'white', 
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              🎤 LISTENING - Click "STOP LISTENING" to stop
            </div>
          )}
          
          {/* Voice Transcript */}
          {transcript && (
            <div style={{ 
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: 'var(--text-color)',
              minHeight: '40px'
            }}>
              <strong>You said:</strong> {transcript}
            </div>
          )}
          
          {/* Voice Commands Help */}
          <div style={{ 
            marginTop: '1rem',
            fontSize: '0.8rem',
            color: isListening ? 'white' : 'var(--secondary-color)'
          }}>
            <strong>Voice Commands:</strong> "Fix leak", "Replace bulb", "Unclog drain", "Clean area", "Check equipment"
            <br />
            <strong>💡 Tip:</strong> Click "STOP LISTENING" when done, or it auto-stops after 30 seconds.
          </div>
        </div>
        
        {/* Quick Actions */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>⚡ Quick Actions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease'
                }}
                title={`${action.description} (${getTimeEstimateText(action.time)})`}
              >
                {getCategoryIcon(action.category)}
                {action.name}
              </button>
            ))}
          </div>
        </div>

        {/* Template Button */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: showTemplates ? 'var(--primary-color)' : 'white',
              color: showTemplates ? 'white' : 'var(--text-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileText size={16} />
            {showTemplates ? 'Hide Templates' : 'Show Task Templates'}
          </button>
        </div>

        {/* Task Templates */}
        {showTemplates && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            backgroundColor: 'var(--light-color)', 
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📋 Task Templates</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(taskTemplates).map(([category, templates]) => (
                <div key={category}>
                  <h5 style={{ 
                    marginBottom: '0.5rem', 
                    color: 'var(--text-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {getCategoryIcon(category)}
                    {category}
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateSelect(template)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'var(--text-color)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          textAlign: 'left',
                          maxWidth: '200px',
                          transition: 'all 0.2s ease'
                        }}
                        title={`${template.description} (${getTimeEstimateText(template.time)})`}
                      >
                        <div style={{ fontWeight: '500' }}>{template.name}</div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: 'var(--secondary-color)',
                          marginTop: '0.25rem'
                        }}>
                          {getTimeEstimateText(template.time)} • {template.complexity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Task Input (Secondary) */}
        <div style={{ 
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--light-color)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            marginBottom: '0.5rem', 
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Keyboard size={16} />
            Manual Input (Alternative)
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your task here... (e.g., 'Fix the leaky faucet in the men's bathroom today')"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                minHeight: '60px',
                resize: 'vertical'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  processUserInput()
                }
              }}
            />
            <button
              onClick={processUserInput}
              disabled={!userInput.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: userInput.trim() ? 'var(--primary-color)' : 'var(--secondary-color)',
                color: 'white',
                cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                alignSelf: 'flex-end'
              }}
            >
              <Send size={16} />
              Add Task
            </button>
          </div>
        </div>
      </div>

        {/* Priority Legend */}
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Priority Levels:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--danger-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                <AlertCircle size={12} aria-hidden="true" />
              High Priority
              </span>
            <span style={{ fontSize: '0.9rem' }}>Do Today - Urgent fixes and critical issues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--warning-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                <Clock size={12} aria-hidden="true" />
              Medium Priority
              </span>
            <span style={{ fontSize: '0.9rem' }}>This Week - Important projects and repairs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--success-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                <Calendar size={12} aria-hidden="true" />
              Low Priority
              </span>
            <span style={{ fontSize: '0.9rem' }}>When Possible - Improvements and enhancements</span>
            </div>
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem', 
            backgroundColor: 'var(--warning-color)', 
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: 'white'
          }}>
            <strong>💡 Tip:</strong> Tasks older than 7 days are highlighted to help you prioritize what's been waiting the longest.
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>📊 Task Analytics</h4>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: showAnalytics ? 'var(--primary-color)' : 'white',
              color: showAnalytics ? 'white' : 'var(--text-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Brain size={16} />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
        
        {showAnalytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Quick Stats */}
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {tasks.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Total Tasks</div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {tasks.filter(t => t.completed).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Completed</div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                {tasks.filter(t => !t.completed).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Pending</div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>
                {tasks.filter(t => t.priority === 1 && !t.completed).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>High Priority</div>
            </div>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>🤖 AI Suggestions</h4>
          <button
            onClick={generateAiSuggestions}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={16} />
            Get AI Suggestions
          </button>
        </div>
        
        {aiSuggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{suggestion.suggestion}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{suggestion.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Modal */}
      {showVoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>🎤 Voice Input</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <textarea
                value={voiceModalText}
                onChange={(e) => setVoiceModalText(e.target.value)}
                placeholder="Your voice input will appear here..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={voiceModalListening ? stopVoiceModalListening : startVoiceModalListening}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: voiceModalListening ? '#dc3545' : 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {voiceModalListening ? <Square size={16} /> : <Mic size={16} />}
                {voiceModalListening ? 'Stop' : 'Start'} Recording
              </button>
              
              <button
                onClick={applyVoiceModalText}
                disabled={!voiceModalText.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: voiceModalText.trim() ? 'var(--success-color)' : 'var(--secondary-color)',
                  color: 'white',
                  cursor: voiceModalText.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Add to Task
              </button>
              
              <button
                onClick={closeVoiceModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  color: 'var(--text-color)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Mode - Clarifying Questions */}
      {conversationMode && (
        <div className="card" style={{ border: '2px solid var(--primary-color)', backgroundColor: 'var(--light-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <HelpCircle size={20} color="var(--primary-color)" />
            <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>Task Details</h3>
          </div>
          
          {/* Conversation History */}
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            {conversationHistory.map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '0.5rem',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: msg.type === 'user' ? 'var(--primary-color)' : 'var(--light-color)',
                color: msg.type === 'user' ? 'white' : 'var(--text-color)',
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <strong>{msg.type === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
              </div>
            ))}
          </div>

          {/* Current Question */}
          {clarifyingQuestions.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                {clarifyingQuestions[0].question}
              </h4>
              
              {clarifyingQuestions[0].type === 'select' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {clarifyingQuestions[0].options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleClarifyingAnswer(clarifyingQuestions[0].id, option.value)}
                      style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--light-color)'
                        e.target.style.borderColor = 'var(--primary-color)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white'
                        e.target.style.borderColor = 'var(--border-color)'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={() => {
              setConversationMode(false)
              setCurrentTask(null)
              setClarifyingQuestions([])
              setTaskDetails({})
              setConversationHistory([])
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--danger-color)',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'var(--danger-color)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* AI Assistant Suggestions */}
      {showSuggestions && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
            🤖 AI Assistant Suggestions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {generateSmartSuggestions().map((suggestion, index) => (
              <div key={index} style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: suggestion.type === 'urgent' ? 'var(--danger-color)' : 
                               suggestion.type === 'warning' ? 'var(--warning-color)' : 
                               suggestion.type === 'tip' ? 'var(--success-color)' : 'var(--primary-color)',
                color: 'white',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {suggestion.type === 'urgent' && <AlertCircle size={16} />}
                {suggestion.type === 'warning' && <AlertTriangle size={16} />}
                {suggestion.type === 'tip' && <Lightbulb size={16} />}
                {suggestion.type === 'info' && <Info size={16} />}
                {suggestion.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'white'
          }}
        >
          <option value="all">All Categories</option>
          <option value="HVAC">HVAC</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Painting">Painting</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Equipment">Equipment</option>
          <option value="Safety">Safety</option>
          <option value="SpecialProject">Special Project</option>
          <option value="General">General</option>
        </select>
        
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            backgroundColor: showSuggestions ? 'var(--primary-color)' : 'white',
            color: showSuggestions ? 'white' : 'var(--text-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Brain size={16} />
          AI Suggestions
        </button>
      </div>

      {/* Tasks List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Task List</h3>
          <button
            className="btn btn-secondary"
            onClick={loadTasks}
            disabled={loading}
            title="Refresh tasks"
            aria-label="Refresh tasks"
          >
            <RotateCcw size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader size={32} />
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-color)' }}>
            <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tasks
              .filter(task => selectedCategory === 'all' || task.category === selectedCategory)
              .map(task => {
              const daysElapsed = getDaysElapsed(task.created_at)
              const isOldTask = daysElapsed > 7
              
              return (
              <div key={task.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem',
                  border: isOldTask ? '2px solid var(--warning-color)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                  backgroundColor: isOldTask ? 'var(--light-color)' : 'var(--light-color)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}>
                  {/* Age Warning Icon for old tasks */}
                  {isOldTask && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      color: 'var(--warning-color)',
                      fontSize: '0.8rem'
                    }}>
                      <AlertCircle size={16} />
                    </div>
                  )}
                  
                  {/* Category Icon */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                  color: 'white',
                    flexShrink: 0
                  }}>
                    {getCategoryIcon(task.category)}
                </div>

                {/* Task Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    color: task.status === 'completed' ? 'var(--secondary-color)' : 'var(--text-color)',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                  }}>
                    {task.task_list}
                  </div>
                    
                    {/* Task Details Row */}
                  <div style={{ 
                    fontSize: '0.8rem', 
                      color: isOldTask ? 'var(--warning-color)' : 'var(--secondary-color)',
                      fontWeight: isOldTask ? '600' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>{getPriorityDescription(task.priority)}</span>
                      <span>• {getTaskAgeText(task.created_at)}</span>
                      <span>• {task.category}</span>
                      {task.estimated_time && (
                        <span>• ⏱️ {getTimeEstimateText(task.estimated_time)}</span>
                      )}
                      {task.complexity && (
                        <span style={{ 
                          color: getComplexityColor(task.complexity),
                          fontWeight: '600'
                        }}>
                          • {task.complexity.charAt(0).toUpperCase() + task.complexity.slice(1)} complexity
                        </span>
                      )}
                      {task.timing && task.timing !== 'today' && (
                        <span>• {task.timing.replace('_', ' ')}</span>
                      )}
                      {task.day_of_week && (
                        <span>• {task.day_of_week.charAt(0).toUpperCase() + task.day_of_week.slice(1)}</span>
                      )}
                      {task.week_of_month && task.week_of_month > 0 && (
                        <span>• Week {task.week_of_month}</span>
                      )}
                      {task.time_of_day && (
                        <span>• {task.time_of_day.charAt(0).toUpperCase() + task.time_of_day.slice(1)}</span>
                      )}
                  </div>
                </div>

                  {/* Priority Badge */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    minWidth: '60px',
                    justifyContent: 'center'
                  }}>
                    {getPriorityIcon(task.priority)}
                    {getPriorityLabel(task.priority)}
                  </div>

                {/* Priority Dropdown */}
                <select
                  value={task.priority}
                  onChange={(e) => updateTaskPriority(task.id, parseInt(e.target.value))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    backgroundColor: 'white'
                  }}
                >
                    <option value={1}>High</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Low</option>
                </select>

                {/* Status Toggle */}
                <button
                  onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    color: task.status === 'completed' ? 'var(--success-color)' : 'var(--secondary-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {task.status === 'completed' ? 
                    <CheckSquare size={20} aria-hidden="true" /> : 
                    <Square size={20} aria-hidden="true" />
                  }
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  aria-label="Delete task"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    color: 'var(--danger-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Task Analytics */}
      {tasks.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>📊 Task Analytics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {tasks.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Total Tasks</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>
                {tasks.filter(t => t.priority === 1).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>High Priority</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                {tasks.filter(t => getDaysElapsed(t.created_at) > 7).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Overdue</div>
            </div>
          </div>
          
          {/* Category Distribution */}
          <div style={{ marginTop: '1rem' }}>
            <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Tasks by Category:</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(
                tasks.reduce((acc, task) => {
                  acc[task.category] = (acc[task.category] || 0) + 1
                  return acc
                }, {})
              ).map(([category, count]) => (
                <div key={category} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem'
                }}>
                  {getCategoryIcon(category)}
                  <span>{category}: {count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
})

Tasks.displayName = 'Tasks'

export default React.memo(Tasks) 