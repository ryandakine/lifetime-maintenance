import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Brain,
  List,
  RefreshCw
} from 'lucide-react'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const [taskInput, setTaskInput] = useState({
    userInput: '',
    projectId: ''
  })

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

  const loadTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', 'current-user') // Replace with actual user ID
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
      console.log('Tasks loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading tasks:', error)
      showMessage('error', 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const processTaskInput = async (e) => {
    e.preventDefault()
    if (!taskInput.userInput.trim()) {
      showMessage('error', 'Please enter some tasks')
      return
    }

    try {
      setLoading(true)
      
      // Use Claude 4.0 Max API to parse task input
      const parsedTasks = await parseTasksWithClaude(taskInput.userInput)
      
      if (parsedTasks.length === 0) {
        showMessage('error', 'No valid tasks found in input')
        return
      }

      // Save parsed tasks to Supabase
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert(
          parsedTasks.map(task => ({
            user_id: 'current-user', // Replace with actual user ID
            task_list: task.name,
            project_id: taskInput.projectId || task.category || 'general',
            status: 'pending',
            notes: task.details || '',
            due_date: task.dueDate || null
          }))
        )
        .select()

      if (error) throw error

      // Update local state
      setTasks([...data, ...tasks])
      setTaskInput({ userInput: '', projectId: '' })
      
      console.log(`Added ${data.length} new tasks`)
      showMessage('success', `Added ${data.length} new tasks`)
      
    } catch (error) {
      console.error('Error processing tasks:', error)
      showMessage('error', 'Failed to process tasks')
    } finally {
      setLoading(false)
    }
  }

  const parseTasksWithClaude = async (userInput) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Claude API key not configured, using fallback parsing')
        return parseTasksFallback(userInput)
      }

      // Get existing tasks for context
      const { data: existingTasks } = await supabase
        .from(TABLES.TASKS)
        .select('task_list, status')
        .eq('user_id', 'current-user')
        .limit(5)

      const existingTasksContext = existingTasks?.map(t => `- ${t.task_list} (${t.status})`).join('\n') || 'No existing tasks'

      const prompt = `Parse this maintenance task input into individual tasks. Consider existing tasks to avoid duplicates.

User Input: "${userInput}"

Existing Tasks:
${existingTasksContext}

Instructions:
1. Break down the input into individual, actionable tasks
2. Extract task names, categories, and any details
3. Identify due dates if mentioned
4. Avoid duplicates with existing tasks
5. Return as JSON array with: name, category, details, dueDate (optional)

Example output:
[
  {"name": "Fix HVAC system", "category": "hvac", "details": "Check filters and thermostat", "dueDate": "2024-01-15"},
  {"name": "Replace light bulb", "category": "electrical", "details": "LED replacement in gym area"}
]

Tasks:`

      console.log('Sending task parsing request to Claude API...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
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
      const responseText = result.content[0].text

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON found in Claude response, using fallback')
        return parseTasksFallback(userInput)
      }

      const parsedTasks = JSON.parse(jsonMatch[0])
      console.log('Tasks parsed with Claude:', parsedTasks)
      return parsedTasks

    } catch (error) {
      console.error('Error calling Claude API:', error)
      console.log('Using fallback task parsing due to Claude API error')
      return parseTasksFallback(userInput)
    }
  }

  const parseTasksFallback = (userInput) => {
    // Fallback parsing when Claude API is not available
    const taskPhrases = userInput.split(/[,;]+/).map(phrase => phrase.trim()).filter(phrase => phrase.length > 0)
    
    return taskPhrases.map(phrase => ({
      name: phrase,
      category: 'general',
      details: '',
      dueDate: null
    }))
  }

  const updateTaskStatus = async (taskId, status) => {
    try {
      const { error } = await supabase
        .from(TABLES.TASKS)
        .update({ status })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ))
      
      console.log(`Task ${taskId} status updated to ${status}`)
    } catch (error) {
      console.error('Error updating task status:', error)
      showMessage('error', 'Failed to update task status')
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

  const handleTaskCompletion = async (taskId, isCompleted) => {
    const newStatus = isCompleted ? 'completed' : 'pending'
    await updateTaskStatus(taskId, newStatus)
  }

  const groupTasksByStatus = () => {
    const grouped = {
      pending: tasks.filter(task => task.status === 'pending'),
      completed: tasks.filter(task => task.status === 'completed')
    }
    return grouped
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const { pending, completed } = groupTasksByStatus()

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

      <div className="card">
        <h3>Tell me your tasks</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Describe your maintenance tasks and I'll break them down into individual items.
        </p>
        
        <form onSubmit={processTaskInput}>
          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-textarea"
              value={taskInput.userInput}
              onChange={(e) => setTaskInput({...taskInput, userInput: e.target.value})}
              placeholder="e.g., Fix HVAC, change light bulb, check breakers, complete concrete project..."
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Project Category (optional)</label>
            <input
              type="text"
              className="form-input"
              value={taskInput.projectId}
              onChange={(e) => setTaskInput({...taskInput, projectId: e.target.value})}
              placeholder="e.g., hvac, electrical, concrete, general"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              type="submit"
              className="btn"
              disabled={loading || !taskInput.userInput.trim()}
            >
              {loading ? (
                <>
                  <Brain size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <Plus size={16} style={{ marginRight: '0.5rem' }} />
                  Add to List
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadTasks}
              disabled={loading}
            >
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              Refresh
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Task List</h3>
        
        {loading && tasks.length === 0 ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No tasks yet. Add some tasks above to get started!
          </p>
        ) : (
          <>
            {/* Pending Tasks */}
            {pending.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  Pending Tasks ({pending.length})
                </h4>
                {pending.map(task => (
                  <div key={task.id} className="task-item">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={false}
                      onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                    />
                    <div className="task-content">
                      <div className="task-title">{task.task_list}</div>
                      {task.notes && <div className="task-notes">{task.notes}</div>}
                      {task.project_id && <div className="task-notes">Project: {task.project_id}</div>}
                      {task.due_date && <div className="task-notes">Due: {new Date(task.due_date).toLocaleDateString()}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className={`task-status ${task.status}`}>
                        {task.status}
                      </span>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteTask(task.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completed.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>
                  Completed Tasks ({completed.length})
                </h4>
                {completed.map(task => (
                  <div key={task.id} className="task-item" style={{ opacity: 0.7 }}>
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={true}
                      onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                    />
                    <div className="task-content">
                      <div className="task-title" style={{ textDecoration: 'line-through' }}>
                        {task.task_list}
                      </div>
                      {task.notes && <div className="task-notes">{task.notes}</div>}
                      {task.project_id && <div className="task-notes">Project: {task.project_id}</div>}
                      <div className="task-notes">
                        Completed: {new Date(task.updated_at || task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className={`task-status ${task.status}`}>
                        {task.status}
                      </span>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteTask(task.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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