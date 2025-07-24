import React, { useState, useEffect } from 'react'
import { supabase, TABLES, TASK_STATUS, API_KEYS } from '../lib/supabase'
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2, 
  Upload, 
  Download,
  Send,
  MessageSquare,
  BookOpen,
  ShoppingCart,
  FileText,
  Camera
} from 'lucide-react'

const Maintenance = () => {
  console.log('Rendering Maintenance')
  const [activeTab, setActiveTab] = useState('tasks')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Task states
  const [tasks, setTasks] = useState([])
  const [taskForm, setTaskForm] = useState({
    task_list: '',
    project_id: '',
    status: TASK_STATUS.PENDING,
    due_date: '',
    notes: ''
  })

  // Shopping list states
  const [shoppingLists, setShoppingLists] = useState([])
  const [shoppingForm, setShoppingForm] = useState({
    task_id: '',
    items: ''
  })



  // Knowledge states
  const [knowledge, setKnowledge] = useState([])
  const [knowledgeForm, setKnowledgeForm] = useState({
    question: ''
  })

  // File states
  const [files, setFiles] = useState([])

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

  // Load data on component mount
  useEffect(() => {
    loadTasks()
    loadShoppingLists()
    loadKnowledge()
    loadFiles()
  }, [])

  // Task Management
  const loadTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      showMessage('error', 'Failed to load tasks')
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTask = async (e) => {
    e.preventDefault()
    if (!taskForm.task_list.trim()) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert([{
          user_id: 'current-user', // Replace with actual user ID
          task_list: taskForm.task_list,
          project_id: taskForm.project_id || null,
          status: taskForm.status,
          due_date: taskForm.due_date || null,
          notes: taskForm.notes
        }])
        .select()

      if (error) throw error

      setTasks([data[0], ...tasks])
      setTaskForm({
        task_list: '',
        project_id: '',
        status: TASK_STATUS.PENDING,
        due_date: '',
        notes: ''
      })
      showMessage('success', 'Task saved successfully')
    } catch (error) {
      showMessage('error', 'Failed to save task')
      console.error('Error saving task:', error)
    } finally {
      setLoading(false)
    }
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
    } catch (error) {
      showMessage('error', 'Failed to update task')
      console.error('Error updating task:', error)
    }
  }

  const groupTasksByProject = () => {
    const grouped = {}
    tasks.forEach(task => {
      const project = task.project_id || 'General'
      if (!grouped[project]) {
        grouped[project] = []
      }
      grouped[project].push(task)
    })
    return grouped
  }

  // Shopping List Management
  const loadShoppingLists = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setShoppingLists(data || [])
    } catch (error) {
      console.error('Error loading shopping lists:', error)
    }
  }

  const saveShoppingList = async (e) => {
    e.preventDefault()
    if (!shoppingForm.items.trim()) return

    try {
      setLoading(true)
      
      // Simulate Perplexity API call for part numbers and store info
      const enhancedItems = await enhanceShoppingItems(shoppingForm.items)
      
      const { data, error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .insert([{
          user_id: 'current-user',
          task_id: shoppingForm.task_id || null,
          items_json: enhancedItems
        }])
        .select()

      if (error) throw error

      setShoppingLists([data[0], ...shoppingLists])
      setShoppingForm({ task_id: '', items: '' })
      showMessage('success', 'Shopping list saved')
    } catch (error) {
      showMessage('error', 'Failed to save shopping list')
      console.error('Error saving shopping list:', error)
    } finally {
      setLoading(false)
    }
  }

  const enhanceShoppingItems = async (items) => {
    // Simulate Perplexity API call
    const itemList = items.split('\n').filter(item => item.trim())
    const enhanced = itemList.map(item => ({
      name: item.trim(),
      grainger_part: `GR-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      home_depot_aisle: `Aisle ${Math.floor(Math.random() * 50) + 1}`,
      alternatives: ['Alternative 1', 'Alternative 2'],
      store_address: '123 Main St, Denver, CO 80202'
    }))
    return enhanced
  }



  // Knowledge Management
  const loadKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.KNOWLEDGE)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKnowledge(data || [])
    } catch (error) {
      console.error('Error loading knowledge:', error)
    }
  }

  const searchKnowledge = async (e) => {
    e.preventDefault()
    if (!knowledgeForm.question.trim()) return

    try {
      setLoading(true)
      
      // Simulate Grok API call
      const response = await generateKnowledgeResponse(knowledgeForm.question)
      
      const { data, error } = await supabase
        .from(TABLES.KNOWLEDGE)
        .insert([{
          user_id: 'current-user',
          question: knowledgeForm.question,
          response: response
        }])
        .select()

      if (error) throw error

      setKnowledge([data[0], ...knowledge])
      setKnowledgeForm({ question: '' })
      showMessage('success', 'Knowledge entry saved')
    } catch (error) {
      showMessage('error', 'Failed to search knowledge')
      console.error('Error searching knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateKnowledgeResponse = async (question) => {
    // Simulate Grok API call
    const responses = {
      'light bulb': '1. Turn off power\n2. Remove old bulb\n3. Install new bulb\n4. Test functionality\n\nTools needed: Screwdriver, ladder\nSupplies: New light bulb',
      'concrete': '1. Clean surface\n2. Mix concrete\n3. Apply evenly\n4. Allow to cure\n\nTools needed: Trowel, mixer\nSupplies: Concrete mix, water',
      'default': 'For maintenance tasks, always ensure safety first. Wear appropriate PPE and follow manufacturer guidelines.'
    }

    const lowerQuestion = question.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response
      }
    }
    return responses.default
  }

  // File Management
  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .list()

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      const fileName = `${Date.now()}-${file.name}`
      
      const { error } = await supabase.storage
        .from('work-files')
        .upload(fileName, file)

      if (error) throw error

      await loadFiles()
      showMessage('success', 'File uploaded successfully')
    } catch (error) {
      showMessage('error', 'Failed to upload file')
      console.error('Error uploading file:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .download(fileName)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      showMessage('error', 'Failed to download file')
      console.error('Error downloading file:', error)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const renderTasks = () => (
    <div>
      <div className="card">
        <h3>Add New Task</h3>
        <form onSubmit={saveTask}>
          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-textarea"
              value={taskForm.task_list}
              onChange={(e) => setTaskForm({...taskForm, task_list: e.target.value})}
              placeholder="Enter daily Service Channel tasks, Wednesday 10 AM boss meeting notes, ongoing projects..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Project ID (optional)</label>
            <input
              type="text"
              className="form-input"
              value={taskForm.project_id}
              onChange={(e) => setTaskForm({...taskForm, project_id: e.target.value})}
              placeholder="e.g., concrete, electrical, hvac"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              value={taskForm.notes}
              onChange={(e) => setTaskForm({...taskForm, notes: e.target.value})}
              placeholder="Additional notes..."
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Tasks by Project</h3>
        {Object.entries(groupTasksByProject()).map(([project, projectTasks]) => (
          <div key={project} style={{ marginBottom: '2rem' }}>
            <h4>{project}</h4>
            {projectTasks.map(task => (
              <div key={task.id} className="task-item">
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.status === TASK_STATUS.COMPLETED}
                  onChange={(e) => updateTaskStatus(task.id, e.target.checked ? TASK_STATUS.COMPLETED : TASK_STATUS.PENDING)}
                />
                <div className="task-content">
                  <div className="task-title">{task.task_list}</div>
                  {task.notes && <div className="task-notes">{task.notes}</div>}
                  {task.due_date && <div className="task-notes">Due: {new Date(task.due_date).toLocaleDateString()}</div>}
                </div>
                <span className={`task-status ${task.status}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  const renderShopping = () => (
    <div>
      <div className="card">
        <h3>Create Shopping List</h3>
        <form onSubmit={saveShoppingList}>
          <div className="form-group">
            <label className="form-label">Items (one per line)</label>
            <textarea
              className="form-textarea"
              value={shoppingForm.items}
              onChange={(e) => setShoppingForm({...shoppingForm, items: e.target.value})}
              placeholder="Enter items to purchase...&#10;e.g.,&#10;Light bulbs&#10;Concrete mix&#10;Electrical tape"
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : 'Create List'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Shopping Lists</h3>
        {shoppingLists.map(list => (
          <div key={list.id} className="card">
            <h4>Shopping List - {new Date(list.created_at).toLocaleDateString()}</h4>
            {list.items_json && list.items_json.map((item, index) => (
              <div key={index} className="shopping-item">
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-info">
                    Grainger: {item.grainger_part} | 
                    Home Depot: {item.home_depot_aisle} | 
                    Store: {item.store_address}
                  </div>
                  <div className="item-info">Alternatives: {item.alternatives.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )



  const renderKnowledge = () => (
    <div>
      <div className="card">
        <h3>Maintenance Knowledge Search</h3>
        <form onSubmit={searchKnowledge}>
          <div className="form-group">
            <label className="form-label">Question</label>
            <input
              type="text"
              className="form-input"
              value={knowledgeForm.question}
              onChange={(e) => setKnowledgeForm({...knowledgeForm, question: e.target.value})}
              placeholder="e.g., How to change a light bulb"
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search Knowledge'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Knowledge Base</h3>
        {knowledge.map(entry => (
          <div key={entry.id} className="card">
            <h4>Q: {entry.question}</h4>
            <div style={{ whiteSpace: 'pre-line' }}>
              <strong>A:</strong> {entry.response}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
              {new Date(entry.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFiles = () => (
    <div>
      <div className="card">
        <h3>Upload Work Files</h3>
        <div className="file-upload">
          <input
            type="file"
            onChange={uploadFile}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={loading}
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            <Upload size={48} style={{ marginBottom: '1rem' }} />
            <p>Click to upload files or drag and drop</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
              {loading ? 'Uploading...' : 'Supported formats: PDF, DOC, XLS, JPG, PNG'}
            </p>
          </label>
        </div>
      </div>

      <div className="card">
        <h3>Work Files</h3>
        <div className="file-list">
          {files.map(file => (
            <div key={file.name} className="file-item">
              <div>
                <div style={{ fontWeight: '600' }}>{file.name}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                  Size: {Math.round(file.metadata?.size / 1024)} KB
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => downloadFile(file.name)}
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

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

      <nav className="nav">
        <ul className="nav-list">
          <li>
            <a
              href="/tasks"
              className="nav-link"
            >
              <FileText size={16} style={{ marginRight: '0.5rem' }} />
              Tasks
            </a>
          </li>
          <li>
            <a
              href="/shopping"
              className="nav-link"
            >
              <ShoppingCart size={16} style={{ marginRight: '0.5rem' }} />
              Shopping
            </a>
          </li>
          <li>
            <a
              href="/email"
              className="nav-link"
            >
              <Send size={16} style={{ marginRight: '0.5rem' }} />
              Emails
            </a>
          </li>
          <li>
            <a
              href="/knowledge"
              className="nav-link"
            >
              <BookOpen size={16} style={{ marginRight: '0.5rem' }} />
              Knowledge
            </a>
          </li>
          <li>
            <a
              href="/photos"
              className="nav-link"
            >
              <Camera size={16} style={{ marginRight: '0.5rem' }} />
              Photos
            </a>
          </li>
          <li>
            <button
              className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              <Upload size={16} style={{ marginRight: '0.5rem' }} />
              Files
            </button>
          </li>
        </ul>
      </nav>

      <main style={{ padding: '2rem 0' }}>
        {loading && <div className="loading">Loading...</div>}
        



        {activeTab === 'knowledge' && renderKnowledge()}
        {activeTab === 'files' && renderFiles()}
      </main>
    </div>
  )
}

export default Maintenance 