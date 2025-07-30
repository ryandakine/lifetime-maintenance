import React, { useState, useEffect, useCallback } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import logger from '../lib/logger'
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Star,
  Calendar,
  AlertCircle,
  Wrench,
  Brain,
  Sparkles
} from 'lucide-react'

const TasksKendo = () => {
  // State management
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    status: 'pending'
  })

  // Priority and category options
  const priorityOptions = [
    { text: 'Low', value: 'low' },
    { text: 'Medium', value: 'medium' },
    { text: 'High', value: 'high' },
    { text: 'Critical', value: 'critical' }
  ]

  const categoryOptions = [
    { text: 'Cardio Equipment', value: 'cardio' },
    { text: 'Strength Equipment', value: 'strength' },
    { text: 'Facility Maintenance', value: 'facility' },
    { text: 'Pool & Spa', value: 'pool' },
    { text: 'HVAC', value: 'hvac' },
    { text: 'Cleaning', value: 'cleaning' },
    { text: 'Safety & Security', value: 'safety' }
  ]

  const statusOptions = [
    { text: 'Pending', value: 'pending' },
    { text: 'In Progress', value: 'in-progress' },
    { text: 'Completed', value: 'completed' },
    { text: 'On Hold', value: 'on-hold' }
  ]

  // Load tasks from Supabase
  const loadTasks = useCallback(async () => {
    try {
      logger.info('TasksKendo:loadTasks:start')
      setLoading(true)
      
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('TasksKendo:loadTasks:error', { error: error.message })
        return
      }

      const processedTasks = data.map((task, index) => ({
        ...task,
        id: task.id || index + 1,
        priorityText: priorityOptions.find(p => p.value === task.priority)?.text || 'Medium',
        categoryText: categoryOptions.find(c => c.value === task.category)?.text || 'General',
        statusText: statusOptions.find(s => s.value === task.status)?.text || 'Pending',
        dueDate: task.due_date ? new Date(task.due_date) : null,
        createdAt: new Date(task.created_at),
        daysSinceCreated: Math.floor((Date.now() - new Date(task.created_at)) / (1000 * 60 * 60 * 24))
      }))

      setTasks(processedTasks)
      logger.info('TasksKendo:loadTasks:success', { count: processedTasks.length })
      
    } catch (error) {
      logger.error('TasksKendo:loadTasks:catch', { error: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle task status
  const toggleTaskStatus = useCallback(async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      
      const { error } = await supabase
        .from(TABLES.TASKS)
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)

      if (error) {
        logger.error('TasksKendo:toggleTaskStatus:error', { taskId, error: error.message })
        return
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              statusText: statusOptions.find(s => s.value === newStatus)?.text || 'Pending'
            }
          : task
      ))

      logger.info('TasksKendo:toggleTaskStatus:success', { taskId, newStatus })
      
    } catch (error) {
      logger.error('TasksKendo:toggleTaskStatus:catch', { taskId, error: error.message })
    }
  }, [])

  // Add new task
  const addTask = useCallback(async () => {
    try {
      if (!newTask.title.trim()) {
        alert('Task title is required')
        return
      }

      logger.info('TasksKendo:addTask:start', { title: newTask.title })

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        category: newTask.category,
        status: 'pending',
        due_date: newTask.dueDate || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert([taskData])
        .select()

      if (error) {
        logger.error('TasksKendo:addTask:error', { error: error.message })
        alert('Error creating task')
        return
      }

      // Reset form and reload tasks
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: '',
        status: 'pending'
      })
      setShowAddForm(false)
      await loadTasks()

      logger.info('TasksKendo:addTask:success', { taskId: data[0]?.id })
      alert('Task created successfully')

    } catch (error) {
      logger.error('TasksKendo:addTask:catch', { error: error.message })
      alert('Failed to create task')
    }
  }, [newTask, loadTasks])

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#e74c3c'
      case 'high': return '#f39c12'
      case 'medium': return '#3498db'
      case 'low': return '#27ae60'
      default: return '#7f8c8d'
    }
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardio': return '🏃'
      case 'strength': return '💪'
      case 'facility': return '🏢'
      case 'pool': return '🏊'
      case 'hvac': return '🌡️'
      case 'cleaning': return '🧹'
      case 'safety': return '🛡️'
      default: return '⚙️'
    }
  }

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  if (loading) {
    return (
      <div className="tasks-kendo-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Tasks Pro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tasks-kendo-container">
      <div className="tasks-header">
        <h2>🔧 Maintenance Tasks Pro</h2>
        <p>Professional task management interface</p>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="add-task-form">
          <h3>Add New Task</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Task Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                className="form-select"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                className="form-select"
              >
                <option value="">Select category...</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={addTask}>
              Create Task
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="tasks-table-container">
        <div className="table-header">
          <h3>Tasks ({tasks.length})</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} />
            Add New Task
          </button>
        </div>

        <div className="tasks-table">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Age</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <button
                      className={`status-toggle ${task.status}`}
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      title={`Click to ${task.status === 'completed' ? 'reopen' : 'complete'} task`}
                    >
                      {task.status === 'completed' ? <CheckSquare size={16} /> : <Square size={16} />}
                      <span>{task.statusText}</span>
                    </button>
                  </td>
                  <td>{task.title}</td>
                  <td>
                    <div className="priority-cell" style={{ color: getPriorityColor(task.priority) }}>
                      <Star size={14} fill="currentColor" />
                      <span>{task.priorityText}</span>
                    </div>
                  </td>
                  <td>
                    <div className="category-cell">
                      <span>{getCategoryIcon(task.category)}</span>
                      <span>{task.categoryText}</span>
                    </div>
                  </td>
                  <td>{task.description}</td>
                  <td>
                    <div className="due-date-cell">
                      {task.dueDate ? (
                        <>
                          <Calendar size={14} />
                          <span>{task.dueDate.toLocaleDateString()}</span>
                        </>
                      ) : (
                        <span className="no-date">No due date</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="days-created-cell">
                      <span className={task.daysSinceCreated > 7 ? 'old-task' : 'recent-task'}>
                        {task.daysSinceCreated} days
                      </span>
                    </div>
                  </td>
                  <td>{task.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .tasks-kendo-container {
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: calc(100vh - 200px);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tasks-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .tasks-header h2 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .tasks-header p {
          color: #6c757d;
          font-size: 1.1rem;
          margin: 0;
        }

        .add-task-form {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          border: 1px solid #e1e5e9;
          margin-bottom: 30px;
          padding: 30px;
        }

        .add-task-form h3 {
          color: #495057;
          margin-bottom: 20px;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-field {
          flex: 1;
        }

        .form-field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #495057;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          outline: none;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          border: 2px solid #e1e5e9;
          color: #495057;
        }

        .btn-secondary:hover {
          border-color: #667eea;
          color: #667eea;
          background: #f8f9ff;
        }

        .tasks-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          border: 1px solid #e1e5e9;
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 2px solid #dee2e6;
        }

        .table-header h3 {
          margin: 0;
          color: #495057;
        }

        .tasks-table {
          overflow-x: auto;
        }

        .tasks-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .tasks-table th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          padding: 12px;
          text-align: left;
          border-right: 1px solid rgba(255,255,255,0.2);
        }

        .tasks-table td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .tasks-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .tasks-table tr:hover {
          background-color: #e3f2fd;
        }

        .status-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-toggle:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .status-toggle.completed {
          color: #10b981;
        }

        .status-toggle.pending {
          color: #6b7280;
        }

        .priority-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .due-date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .due-date-cell .no-date {
          color: #9ca3af;
          font-style: italic;
          font-weight: 400;
        }

        .days-created-cell .old-task {
          color: #ef4444;
          font-weight: 600;
        }

        .days-created-cell .recent-task {
          color: #10b981;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .tasks-kendo-container {
            padding: 15px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 15px;
          }
          
          .tasks-table {
            overflow-x: auto;
          }
          
          .tasks-header h2 {
            font-size: 1.5rem;
          }
          
          .add-task-form {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default TasksKendo 