import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import logger from '../lib/logger'

// Kendo UI imports
import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid'
import { Button } from '@progress/kendo-react-buttons'
import { Input, TextArea } from '@progress/kendo-react-inputs'
import { DropDownList, ComboBox } from '@progress/kendo-react-dropdowns'
import { DatePicker } from '@progress/kendo-react-dateinputs'
import { Notification, NotificationGroup } from '@progress/kendo-react-notification'
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
  const [notifications, setNotifications] = useState([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: null,
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
        addNotification('Error loading tasks', 'error')
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
      addNotification('Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Add notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      show: true
    }
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
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
        addNotification('Error updating task status', 'error')
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
      addNotification(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`, 'success')
      
    } catch (error) {
      logger.error('TasksKendo:toggleTaskStatus:catch', { taskId, error: error.message })
      addNotification('Failed to update task', 'error')
    }
  }, [])

  // Add new task
  const addTask = useCallback(async () => {
    try {
      if (!newTask.title.trim()) {
        addNotification('Task title is required', 'warning')
        return
      }

      logger.info('TasksKendo:addTask:start', { title: newTask.title })

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        category: newTask.category,
        status: 'pending',
        due_date: newTask.dueDate?.toISOString(),
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert([taskData])
        .select()

      if (error) {
        logger.error('TasksKendo:addTask:error', { error: error.message })
        addNotification('Error creating task', 'error')
        return
      }

      // Reset form and reload tasks
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: null,
        status: 'pending'
      })
      setShowAddForm(false)
      await loadTasks()

      logger.info('TasksKendo:addTask:success', { taskId: data[0]?.id })
      addNotification('Task created successfully', 'success')

    } catch (error) {
      logger.error('TasksKendo:addTask:catch', { error: error.message })
      addNotification('Failed to create task', 'error')
    }
  }, [newTask, loadTasks])

  // Custom cell renderers
  const StatusCell = ({ dataItem }) => (
    <div className="task-status-cell">
      <button
        className={`status-toggle ${dataItem.status}`}
        onClick={() => toggleTaskStatus(dataItem.id, dataItem.status)}
        title={`Click to ${dataItem.status === 'completed' ? 'reopen' : 'complete'} task`}
      >
        {dataItem.status === 'completed' ? <CheckSquare size={16} /> : <Square size={16} />}
        <span>{dataItem.statusText}</span>
      </button>
    </div>
  )

  const PriorityCell = ({ dataItem }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'critical': return '#e74c3c'
        case 'high': return '#f39c12'
        case 'medium': return '#3498db'
        case 'low': return '#27ae60'
        default: return '#7f8c8d'
      }
    }

    return (
      <div className="priority-cell" style={{ color: getPriorityColor(dataItem.priority) }}>
        <Star size={14} fill="currentColor" />
        <span>{dataItem.priorityText}</span>
      </div>
    )
  }

  const CategoryCell = ({ dataItem }) => {
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

    return (
      <div className="category-cell">
        <span>{getCategoryIcon(dataItem.category)}</span>
        <span>{dataItem.categoryText}</span>
      </div>
    )
  }

  const DueDateCell = ({ dataItem }) => (
    <div className="due-date-cell">
      {dataItem.dueDate ? (
        <>
          <Calendar size={14} />
          <span>{dataItem.dueDate.toLocaleDateString()}</span>
        </>
      ) : (
        <span className="no-date">No due date</span>
      )}
    </div>
  )

  const DaysCreatedCell = ({ dataItem }) => (
    <div className="days-created-cell">
      <span className={dataItem.daysSinceCreated > 7 ? 'old-task' : 'recent-task'}>
        {dataItem.daysSinceCreated} days
      </span>
    </div>
  )

  // Grid toolbar
  const GridToolbarComponent = () => (
    <GridToolbar>
      <Button
        primary={true}
        onClick={() => setShowAddForm(!showAddForm)}
        icon={<Plus size={16} />}
      >
        Add New Task
      </Button>
      <Button
        onClick={loadTasks}
        icon={<Sparkles size={16} />}
      >
        Refresh
      </Button>
    </GridToolbar>
  )

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return (
    <div className="tasks-kendo-container">
      <div className="tasks-header">
        <h2>🔧 Maintenance Tasks</h2>
        <p>Professional task management with Kendo UI Grid</p>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="add-task-form kendo-form">
          <h3>Add New Task</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Task Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
              />
            </div>
            <div className="form-field">
              <label>Priority</label>
              <DropDownList
                data={priorityOptions}
                textField="text"
                dataItemKey="value"
                value={priorityOptions.find(p => p.value === newTask.priority)}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Category</label>
              <ComboBox
                data={categoryOptions}
                textField="text"
                dataItemKey="value"
                value={categoryOptions.find(c => c.value === newTask.category)}
                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value?.value || '' }))}
                placeholder="Select category..."
                allowCustom={true}
              />
            </div>
            <div className="form-field">
              <label>Due Date</label>
              <DatePicker
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Description</label>
            <TextArea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button primary={true} onClick={addTask}>
              Create Task
            </Button>
            <Button onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Kendo Grid */}
      <div className="grid-container">
        <Grid
          data={tasks}
          loading={loading}
          pageable={{
            buttonCount: 4,
            pageSizes: [10, 20, 50],
            info: true
          }}
          sortable={true}
          filterable={true}
          resizable={true}
          reorderable={true}
          groupable={true}
          columnMenu={true}
          toolbar={GridToolbarComponent}
          style={{ height: '600px' }}
        >
          <GridColumn
            field="status"
            title="Status"
            width="120px"
            cell={StatusCell}
            filterable={false}
          />
          <GridColumn
            field="title"
            title="Task Title"
            width="250px"
          />
          <GridColumn
            field="priority"
            title="Priority"
            width="100px"
            cell={PriorityCell}
          />
          <GridColumn
            field="category"
            title="Category"
            width="150px"
            cell={CategoryCell}
          />
          <GridColumn
            field="description"
            title="Description"
            width="300px"
          />
          <GridColumn
            field="dueDate"
            title="Due Date"
            width="120px"
            cell={DueDateCell}
            format="{0:d}"
          />
          <GridColumn
            field="daysSinceCreated"
            title="Age"
            width="80px"
            cell={DaysCreatedCell}
          />
          <GridColumn
            field="createdAt"
            title="Created"
            width="120px"
            format="{0:d}"
          />
        </Grid>
      </div>

      {/* Notifications */}
      <NotificationGroup
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            closable={true}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          >
            <span>{notification.message}</span>
          </Notification>
        ))}
      </NotificationGroup>

      <style jsx>{`
        .tasks-kendo-container {
          padding: 20px;
          background: var(--background-color);
          border-radius: 8px;
          margin: 20px;
        }

        .tasks-header {
          margin-bottom: 20px;
          text-align: center;
        }

        .tasks-header h2 {
          color: var(--primary-color);
          margin-bottom: 5px;
        }

        .tasks-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .add-task-form {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }

        .form-field {
          flex: 1;
        }

        .form-field label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .grid-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .task-status-cell .status-toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .task-status-cell .status-toggle:hover {
          background: var(--hover-background);
        }

        .task-status-cell .status-toggle.completed {
          color: #27ae60;
        }

        .task-status-cell .status-toggle.pending {
          color: #7f8c8d;
        }

        .priority-cell {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
        }

        .category-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .due-date-cell {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .due-date-cell .no-date {
          color: var(--text-secondary);
          font-style: italic;
        }

        .days-created-cell .old-task {
          color: #e74c3c;
          font-weight: 500;
        }

        .days-created-cell .recent-task {
          color: #27ae60;
        }

        @media (max-width: 768px) {
          .tasks-kendo-container {
            margin: 10px;
            padding: 15px;
          }

          .form-row {
            flex-direction: column;
            gap: 15px;
          }

          .grid-container {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default TasksKendo 