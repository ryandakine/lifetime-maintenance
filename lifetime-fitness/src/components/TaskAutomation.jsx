import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Repeat,
  Smartphone,
  Brain,
  Target,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Plus,
  Trash2,
  Edit,
  Star,
  Lightbulb,
  X
} from 'lucide-react'

const TaskAutomation = () => {
  const [automations, setAutomations] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [patterns, setPatterns] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAutomationModal, setShowAutomationModal] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    action: '',
    conditions: [],
    enabled: true
  })

  useEffect(() => {
    loadAutomations()
    analyzeTaskPatterns()
    generateSmartSuggestions()
  }, [])

  const loadAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('task_automations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAutomations(data || [])
    } catch (error) {
      console.error('Error loading automations:', error)
      // Create default automations
      createDefaultAutomations()
    }
  }

  const createDefaultAutomations = () => {
    const defaults = [
      {
        id: 1,
        name: 'Morning Task Prioritization',
        trigger: 'time:09:00',
        action: 'prioritize_tasks',
        conditions: ['workday'],
        enabled: true,
        description: 'Automatically prioritize tasks based on deadlines and importance'
      },
      {
        id: 2,
        name: 'Goal Progress Check',
        trigger: 'weekly:monday',
        action: 'check_goals',
        conditions: [],
        enabled: true,
        description: 'Weekly review of goal progress and adjustments'
      },
      {
        id: 3,
        name: 'Shopping List Sync',
        trigger: 'task_completed:shopping',
        action: 'sync_shopping',
        conditions: ['has_shopping_items'],
        enabled: true,
        description: 'Sync completed shopping items with inventory'
      },
      {
        id: 4,
        name: 'Email Follow-up',
        trigger: 'email_sent',
        action: 'schedule_followup',
        conditions: ['business_email'],
        enabled: true,
        description: 'Automatically schedule follow-up reminders for business emails'
      }
    ]
    setAutomations(defaults)
  }

  const analyzeTaskPatterns = async () => {
    setIsAnalyzing(true)
    try {
      // Analyze recent tasks for patterns
      const { data: tasks } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (tasks && tasks.length > 0) {
        const patterns = findTaskPatterns(tasks)
        setPatterns(patterns)
        
        // Generate automation suggestions based on patterns
        const automationSuggestions = generateAutomationSuggestions(patterns)
        setSuggestions(automationSuggestions)
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const findTaskPatterns = (tasks) => {
    const patterns = []
    
    // Time-based patterns
    const timePatterns = {}
    tasks.forEach(task => {
      const hour = new Date(task.created_at).getHours()
      timePatterns[hour] = (timePatterns[hour] || 0) + 1
    })
    
    const peakHours = Object.entries(timePatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    
    patterns.push({
      type: 'time',
      name: 'Peak Productivity Hours',
      data: peakHours,
      suggestion: `You're most productive at ${peakHours[0]?.hour}:00. Schedule important tasks during these hours.`
    })

    // Task type patterns
    const taskTypes = {}
    tasks.forEach(task => {
      const type = categorizeTask(task.task_list)
      taskTypes[type] = (taskTypes[type] || 0) + 1
    })
    
    const commonTypes = Object.entries(taskTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }))
    
    patterns.push({
      type: 'category',
      name: 'Most Common Task Types',
      data: commonTypes,
      suggestion: `You frequently work on ${commonTypes[0]?.type} tasks. Consider batching similar tasks.`
    })

    // Completion patterns
    const completionRate = tasks.filter(t => t.status === 'completed').length / tasks.length
    patterns.push({
      type: 'completion',
      name: 'Task Completion Rate',
      data: { rate: completionRate },
      suggestion: `Your completion rate is ${Math.round(completionRate * 100)}%. Focus on smaller, achievable tasks to improve this.`
    })

    return patterns
  }

  const categorizeTask = (taskList) => {
    const lower = taskList.toLowerCase()
    if (lower.includes('email') || lower.includes('communication')) return 'Communication'
    if (lower.includes('maintenance') || lower.includes('repair')) return 'Maintenance'
    if (lower.includes('shopping') || lower.includes('purchase')) return 'Shopping'
    if (lower.includes('meeting') || lower.includes('call')) return 'Meetings'
    if (lower.includes('document') || lower.includes('report')) return 'Documentation'
    return 'Other'
  }

  const generateAutomationSuggestions = (patterns) => {
    const suggestions = []
    
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'time':
          suggestions.push({
            id: Date.now() + Math.random(),
            title: 'Smart Scheduling',
            description: pattern.suggestion,
            automation: {
              trigger: `time:${pattern.data[0]?.hour}:00`,
              action: 'schedule_important_tasks',
              conditions: ['workday']
            }
          })
          break
        case 'category':
          suggestions.push({
            id: Date.now() + Math.random(),
            title: 'Task Batching',
            description: pattern.suggestion,
            automation: {
              trigger: 'task_created',
              action: 'suggest_batching',
              conditions: [`category:${pattern.data[0]?.type}`]
            }
          })
          break
        case 'completion':
          if (pattern.data.rate < 0.7) {
            suggestions.push({
              id: Date.now() + Math.random(),
              title: 'Break Down Tasks',
              description: pattern.suggestion,
              automation: {
                trigger: 'task_created',
                action: 'suggest_breakdown',
                conditions: ['complex_task']
              }
            })
          }
          break
      }
    })

    return suggestions
  }

  const generateSmartSuggestions = async () => {
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
              content: `Based on these task patterns, suggest intelligent automations:
                Patterns: ${JSON.stringify(patterns)}
                
                Provide 3-5 specific automation suggestions that would:
                1. Save time on repetitive tasks
                2. Improve productivity
                3. Reduce cognitive load
                4. Ensure nothing falls through the cracks
                
                Format as JSON array with objects containing: title, description, trigger, action, conditions`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiSuggestions = JSON.parse(data.choices[0].message.content)
        setSuggestions(prev => [...prev, ...aiSuggestions])
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    }
  }

  const createAutomation = async () => {
    try {
      const { data, error } = await supabase
        .from('task_automations')
        .insert([newAutomation])

      if (error) throw error

      setAutomations(prev => [...prev, { ...newAutomation, id: data[0].id }])
      setNewAutomation({ name: '', trigger: '', action: '', conditions: [], enabled: true })
      setShowAutomationModal(false)
    } catch (error) {
      console.error('Error creating automation:', error)
    }
  }

  const toggleAutomation = async (id, enabled) => {
    try {
      const { error } = await supabase
        .from('task_automations')
        .update({ enabled: !enabled })
        .eq('id', id)

      if (error) throw error

      setAutomations(prev => 
        prev.map(auto => 
          auto.id === id ? { ...auto, enabled: !enabled } : auto
        )
      )
    } catch (error) {
      console.error('Error toggling automation:', error)
    }
  }

  const executeAutomation = async (automation) => {
    console.log(`Executing automation: ${automation.name}`)
    
    switch (automation.action) {
      case 'prioritize_tasks':
        await prioritizeTasks()
        break
      case 'check_goals':
        await checkGoals()
        break
      case 'sync_shopping':
        await syncShopping()
        break
      case 'schedule_followup':
        await scheduleFollowup()
        break
      default:
        console.log('Unknown automation action:', automation.action)
    }
  }

  const prioritizeTasks = async () => {
    try {
      const { data: tasks } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (tasks && tasks.length > 0) {
        // Use AI to prioritize tasks
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
                content: `Prioritize these tasks based on urgency, importance, and dependencies:
                  ${JSON.stringify(tasks)}
                  
                  Return a JSON array with task IDs in priority order.`
              }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const priorities = JSON.parse(data.choices[0].message.content)
          
          // Update task priorities
          for (let i = 0; i < priorities.length; i++) {
            await supabase
              .from(TABLES.TASKS)
              .update({ priority: i + 1 })
              .eq('id', priorities[i])
          }
        }
      }
    } catch (error) {
      console.error('Error prioritizing tasks:', error)
    }
  }

  const checkGoals = async () => {
    try {
      const { data: goals } = await supabase
        .from(TABLES.GOALS)
        .select('*')
        .eq('completed', false)

      if (goals && goals.length > 0) {
        // Generate goal progress insights
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
                content: `Analyze these goals and provide actionable insights:
                  ${JSON.stringify(goals)}
                  
                  Provide:
                  1. Progress assessment
                  2. Blockers identification
                  3. Next steps recommendations
                  4. Motivation boost
                  
                  Format as JSON object.`
              }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const insights = JSON.parse(data.choices[0].message.content)
          console.log('Goal insights:', insights)
        }
      }
    } catch (error) {
      console.error('Error checking goals:', error)
    }
  }

  const syncShopping = async () => {
    try {
      const { data: shoppingLists } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .select('*')
        .eq('status', 'completed')

      if (shoppingLists && shoppingLists.length > 0) {
        // Update inventory or trigger reorder reminders
        console.log('Syncing shopping lists:', shoppingLists)
      }
    } catch (error) {
      console.error('Error syncing shopping:', error)
    }
  }

  const scheduleFollowup = async () => {
    try {
      const { data: emails } = await supabase
        .from(TABLES.EMAILS)
        .select('*')
        .eq('sent', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (emails && emails.length > 0) {
        // Create follow-up reminders for business emails
        const businessEmails = emails.filter(email => 
          email.subject.toLowerCase().includes('business') ||
          email.to_email.includes('@lifetime.com')
        )

        businessEmails.forEach(email => {
          // Create a follow-up task
          supabase
            .from(TABLES.TASKS)
            .insert([{
              task_list: `Follow up on: ${email.subject}`,
              status: 'pending',
              priority: 2,
              notes: `Follow up on email sent to ${email.to_email} on ${new Date(email.created_at).toLocaleDateString()}`
            }])
        })
      }
    } catch (error) {
      console.error('Error scheduling followup:', error)
    }
  }

  return (
    <div className="task-automation">
      <div className="automation-header">
        <h2><Zap size={24} /> Task Automation</h2>
        <p>Intelligent automation to handle repetitive tasks and boost productivity</p>
      </div>

      {/* Active Automations */}
      <div className="automations-section">
        <div className="section-header">
          <h3>Active Automations</h3>
          <button
            onClick={() => setShowAutomationModal(true)}
            className="add-btn"
            style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            Add Automation
          </button>
        </div>

        <div className="automations-grid">
          {automations.map(automation => (
            <div key={automation.id} className="automation-card">
              <div className="automation-header">
                <h4>{automation.name}</h4>
                <div className="automation-controls">
                  <button
                    onClick={() => toggleAutomation(automation.id, automation.enabled)}
                    className={`toggle-btn ${automation.enabled ? 'enabled' : 'disabled'}`}
                    style={{
                      background: automation.enabled ? 'var(--success-color)' : 'var(--secondary-color)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {automation.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => executeAutomation(automation)}
                    className="execute-btn"
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Play size={12} />
                  </button>
                </div>
              </div>
              <p className="automation-description">{automation.description}</p>
              <div className="automation-details">
                <span className="trigger">Trigger: {automation.trigger}</span>
                <span className="action">Action: {automation.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Patterns */}
      <div className="patterns-section">
        <h3><TrendingUp size={20} /> Task Patterns</h3>
        {isAnalyzing ? (
          <div className="analyzing">
            <RotateCcw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Analyzing your task patterns...
          </div>
        ) : (
          <div className="patterns-grid">
            {patterns.map((pattern, index) => (
              <div key={index} className="pattern-card">
                <h4>{pattern.name}</h4>
                <p>{pattern.suggestion}</p>
                {pattern.type === 'time' && (
                  <div className="time-chart">
                    {pattern.data.map((item, i) => (
                      <div key={i} className="time-bar">
                        <span>{item.hour}:00</span>
                        <div 
                          className="bar" 
                          style={{ 
                            height: `${(item.count / Math.max(...pattern.data.map(d => d.count))) * 100}px`,
                            background: 'var(--primary-color)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      <div className="suggestions-section">
        <h3><Lightbulb size={20} /> Smart Suggestions</h3>
        <div className="suggestions-grid">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <h4>{suggestion.title}</h4>
              <p>{suggestion.description}</p>
              {suggestion.automation && (
                <button
                  onClick={() => {
                    setNewAutomation(suggestion.automation)
                    setShowAutomationModal(true)
                  }}
                  className="create-automation-btn"
                  style={{
                    background: 'var(--success-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Create Automation
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Automation Modal */}
      {showAutomationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Automation</h3>
              <button
                onClick={() => setShowAutomationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                  placeholder="Automation name"
                />
              </div>
              <div className="form-group">
                <label>Trigger</label>
                <select
                  value={newAutomation.trigger}
                  onChange={(e) => setNewAutomation({...newAutomation, trigger: e.target.value})}
                >
                  <option value="">Select trigger</option>
                  <option value="time:09:00">Daily at 9:00 AM</option>
                  <option value="weekly:monday">Weekly on Monday</option>
                  <option value="task_completed">When task is completed</option>
                  <option value="email_sent">When email is sent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Action</label>
                <select
                  value={newAutomation.action}
                  onChange={(e) => setNewAutomation({...newAutomation, action: e.target.value})}
                >
                  <option value="">Select action</option>
                  <option value="prioritize_tasks">Prioritize tasks</option>
                  <option value="check_goals">Check goals</option>
                  <option value="sync_shopping">Sync shopping</option>
                  <option value="schedule_followup">Schedule follow-up</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowAutomationModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={createAutomation}
                  className="create-btn"
                  disabled={!newAutomation.name || !newAutomation.trigger || !newAutomation.action}
                >
                  Create Automation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .automations-grid, .patterns-grid, .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .automation-card, .pattern-card, .suggestion-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .automation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .automation-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .time-chart {
          display: flex;
          align-items: end;
          gap: 0.5rem;
          height: 60px;
          margin-top: 1rem;
        }
        
        .time-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .bar {
          width: 20px;
          border-radius: 2px;
          transition: height 0.3s ease;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .modal-content {
          padding: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .cancel-btn {
          background: var(--secondary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .create-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .create-btn:disabled {
          background: var(--secondary-color);
          cursor: not-allowed;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default TaskAutomation 