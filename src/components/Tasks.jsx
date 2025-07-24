import React, { useState, useEffect } from 'react'
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
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  RotateCcw,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'

const Tasks = () => {
  console.log('Rendering Tasks')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [userInput, setUserInput] = useState('')
  const [processing, setProcessing] = useState(false)

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
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', 'current-user')
        .order('priority', { ascending: true }) // Sort by priority (1=daily first, 2=weekly, 3=monthly)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
      console.log('Tasks loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading tasks:', error)
      console.log('Tasks component: Data load failed, showing fallback')
      showMessage('error', 'Failed to load tasks')
      setTasks([]) // Ensure empty state for fallback
    } finally {
      setLoading(false)
    }
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
      case 1: return <AlertCircle size={14} />
      case 2: return <Clock size={14} />
      case 3: return <Calendar size={14} />
      default: return <Clock size={14} />
    }
  }

  const getPriorityDescription = (priority) => {
    switch (priority) {
      case 1: return 'High Priority - Do Today'
      case 2: return 'Medium Priority - This Week'
      case 3: return 'Low Priority - This Month'
      default: return 'Medium Priority - This Week'
    }
  }

  const processUserInput = async () => {
    if (!userInput.trim()) return

    try {
      setProcessing(true)
      const anthropicApiKey = API_KEYS.ANTHROPIC

      if (!anthropicApiKey || anthropicApiKey === 'your-anthropic-key') {
        console.warn('Anthropic API key not configured, using fallback parsing')
        // Fallback: simple keyword detection
        const priority = detectPriorityFromKeywords(userInput)
        const taskList = userInput.split('\n').filter(line => line.trim())
        
        await saveTasks(taskList, priority)
        return
      }

      console.log('Processing task input with Claude 4.0 Max...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Parse this maintenance task input and extract tasks with priority levels. 

Input: "${userInput}"

Instructions:
1. Identify individual tasks from the input
2. Determine priority level based on urgency keywords:
   - Priority 1 (Daily/High): "today", "urgent", "asap", "immediate", "now", "critical", "emergency"
   - Priority 2 (Weekly/Medium): "this week", "soon", "important", "need to", "should"
   - Priority 3 (Monthly/Low): "this month", "eventually", "when possible", "low priority"

3. Return JSON format:
{
  "tasks": [
    {
      "task": "task description",
      "priority": 1,
      "reason": "why this priority"
    }
  ]
}

4. If no priority keywords found, default to priority 2 (weekly/medium)
5. Clean up task descriptions (remove priority keywords from task text)
6. Ensure each task is actionable and specific

Example:
Input: "Need to fix the HVAC today, check the pool filter this week, and maybe clean the gutters this month"
Output:
{
  "tasks": [
    {
      "task": "Fix the HVAC",
      "priority": 1,
      "reason": "today keyword indicates urgent/daily priority"
    },
    {
      "task": "Check the pool filter", 
      "priority": 2,
      "reason": "this week keyword indicates weekly priority"
    },
    {
      "task": "Clean the gutters",
      "priority": 3, 
      "reason": "this month keyword indicates monthly/low priority"
    }
  ]
}`
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude API error:', response.status, errorText)
        throw new Error(`Claude API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.content[0].text
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response')
      }

      const parsedData = JSON.parse(jsonMatch[0])
      console.log('Claude parsed tasks:', parsedData)

      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        await saveTasksWithPriority(parsedData.tasks)
      } else {
        throw new Error('Invalid task structure from Claude')
      }

    } catch (error) {
      console.error('Error processing input:', error)
      showMessage('error', 'Failed to process input. Using fallback parsing.')
      
      // Fallback: simple keyword detection
      const priority = detectPriorityFromKeywords(userInput)
      const taskList = userInput.split('\n').filter(line => line.trim())
      await saveTasks(taskList, priority)
    } finally {
      setProcessing(false)
      setUserInput('')
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
        user_id: 'current-user',
        task_list: task,
        priority: priority,
        status: 'pending'
      }))

      const { error } = await supabase
        .from(TABLES.TASKS)
        .insert(tasksToSave)

      if (error) throw error

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
      const { error } = await supabase
        .from(TABLES.TASKS)
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

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
      const { error } = await supabase
        .from(TABLES.TASKS)
        .delete()
        .eq('id', taskId)

      if (error) throw error

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
      <div className="card">
        <h3>Tell me your tasks</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Describe your maintenance tasks and I'll parse them with priority levels. 
          Use keywords like "today", "this week", "this month" for automatic priority detection.
        </p>
        
        <div className="form-group">
          <label className="form-label" htmlFor="task-input">What tasks do you need to complete?</label>
          <textarea
            id="task-input"
            name="task-input"
            className="form-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Example: Fix HVAC system in gym 1, inspect pool equipment"
            rows={4}
            disabled={processing}
          />
        </div>

        <button
          className="btn"
          onClick={processUserInput}
          disabled={!userInput.trim() || processing}
          title="Process tasks"
          aria-label="Process tasks"
        >
          {processing ? (
            <>
              <Loader size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>
              <Brain size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
              Process Tasks
            </>
          )}
        </button>

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
                <AlertCircle size={12} />
                Daily
              </span>
              <span style={{ fontSize: '0.9rem' }}>High Priority - Do Today</span>
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
                <Clock size={12} />
                Weekly
              </span>
              <span style={{ fontSize: '0.9rem' }}>Medium Priority - This Week</span>
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
                <Calendar size={12} />
                Monthly
              </span>
              <span style={{ fontSize: '0.9rem' }}>Low Priority - This Month</span>
            </div>
          </div>
        </div>
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
        
        {loading && tasks.length === 0 ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No tasks yet. Add some tasks above to get started!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--light-color)',
                transition: 'all 0.2s ease'
              }}>
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

                {/* Task Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    color: task.status === 'completed' ? 'var(--secondary-color)' : 'var(--text-color)',
                    fontWeight: '500'
                  }}>
                    {task.task_list}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--secondary-color)',
                    marginTop: '0.25rem'
                  }}>
                    {getPriorityDescription(task.priority)} • {new Date(task.created_at).toLocaleDateString()}
                  </div>
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
                  <option value={1}>Daily (High)</option>
                  <option value={2}>Weekly (Medium)</option>
                  <option value={3}>Monthly (Low)</option>
                </select>

                {/* Status Toggle */}
                <button
                  onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
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
                  {task.status === 'completed' ? <CheckCircle size={20} /> : <Square size={20} />}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
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
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Tasks 