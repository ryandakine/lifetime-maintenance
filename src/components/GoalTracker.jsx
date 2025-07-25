import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Star,
  Plus,
  Edit,
  Trash2,
  Brain,
  Lightbulb,
  Clock,
  Award,
  BarChart3,
  ArrowRight,
  Zap,
  Sparkles,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

const GoalTracker = () => {
  const [goals, setGoals] = useState([])
  const [monetaryGoals, setMonetaryGoals] = useState([])
  const [insights, setInsights] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [newGoal, setNewGoal] = useState({
    category: '',
    description: '',
    progress: 0,
    deadline: '',
    priority: 'medium',
    milestones: []
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    loadGoals()
    generateInsights()
  }, [])

  const loadGoals = async () => {
    try {
      // Load general goals
      const { data: generalGoals } = await supabase
        .from(TABLES.GOALS)
        .select('*')
        .order('created_at', { ascending: false })

      // Load monetary goals
      const { data: moneyGoals } = await supabase
        .from(TABLES.MONETARY_GOALS)
        .select('*')
        .order('created_at', { ascending: false })

      setGoals(generalGoals || [])
      setMonetaryGoals(moneyGoals || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const generateInsights = async () => {
    setIsAnalyzing(true)
    try {
      const allGoals = [...goals, ...monetaryGoals]
      
      if (allGoals.length === 0) {
        setInsights([])
        return
      }

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
              content: `Analyze these goals and provide intelligent insights:
                General Goals: ${JSON.stringify(goals)}
                Monetary Goals: ${JSON.stringify(monetaryGoals)}
                
                Provide:
                1. Overall progress assessment
                2. Goal completion predictions
                3. Potential blockers and solutions
                4. Priority recommendations
                5. Motivation insights
                6. Next steps for each goal
                
                Format as JSON object with keys: assessment, predictions, blockers, priorities, motivation, nextSteps`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const insights = JSON.parse(data.choices[0].message.content)
        setInsights(insights)
        
        // Generate smart suggestions based on insights
        generateSmartSuggestions(insights)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateSmartSuggestions = (insights) => {
    const suggestions = []
    
    // Progress-based suggestions
    if (insights.assessment?.overallProgress < 50) {
      suggestions.push({
        id: Date.now() + 1,
        type: 'progress',
        title: 'Boost Progress',
        description: 'Your overall progress is below 50%. Consider breaking down larger goals into smaller, achievable milestones.',
        action: 'break_down_goals'
      })
    }

    // Deadline-based suggestions
    const upcomingDeadlines = goals.filter(goal => {
      if (!goal.deadline) return false
      const deadline = new Date(goal.deadline)
      const now = new Date()
      const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24)
      return daysUntil <= 30 && daysUntil > 0
    })

    if (upcomingDeadlines.length > 0) {
      suggestions.push({
        id: Date.now() + 2,
        type: 'deadline',
        title: 'Upcoming Deadlines',
        description: `You have ${upcomingDeadlines.length} goal(s) due within 30 days. Time to focus and accelerate progress!`,
        action: 'focus_deadlines'
      })
    }

    // Category-based suggestions
    const categories = {}
    goals.forEach(goal => {
      categories[goal.category] = (categories[goal.category] || 0) + 1
    })

    const unbalancedCategories = Object.entries(categories).filter(([, count]) => count > 3)
    if (unbalancedCategories.length > 0) {
      suggestions.push({
        id: Date.now() + 3,
        type: 'balance',
        title: 'Goal Balance',
        description: `You have many goals in ${unbalancedCategories[0][0]} category. Consider diversifying your focus areas.`,
        action: 'diversify_goals'
      })
    }

    setSuggestions(suggestions)
  }

  const createGoal = async () => {
    try {
      const goalData = {
        ...newGoal,
        user_id: 'current-user', // Replace with actual user ID
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.GOALS)
        .insert([goalData])

      if (error) throw error

      setGoals(prev => [...prev, { ...goalData, id: data[0].id }])
      setNewGoal({ category: '', description: '', progress: 0, deadline: '', priority: 'medium', milestones: [] })
      setShowGoalModal(false)
      
      // Regenerate insights
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const updateGoalProgress = async (goalId, newProgress) => {
    try {
      const { error } = await supabase
        .from(TABLES.GOALS)
        .update({ progress: newProgress, updated_at: new Date().toISOString() })
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => 
        prev.map(goal => 
          goal.id === goalId ? { ...goal, progress: newProgress } : goal
        )
      )

      // Regenerate insights after progress update
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error('Error updating goal progress:', error)
    }
  }

  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from(TABLES.GOALS)
        .delete()
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.filter(goal => goal.id !== goalId))
      
      // Regenerate insights
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--success-color)'
    if (progress >= 50) return 'var(--warning-color)'
    return 'var(--error-color)'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error-color)'
      case 'medium': return 'var(--warning-color)'
      case 'low': return 'var(--success-color)'
      default: return 'var(--secondary-color)'
    }
  }

  const renderGoalCard = (goal) => (
    <div key={goal.id} className="goal-card">
      <div className="goal-header">
        <div className="goal-info">
          <h4>{goal.description}</h4>
          <span className={`priority-badge ${goal.priority}`}>
            {goal.priority}
          </span>
        </div>
        <div className="goal-actions">
          <button
            onClick={() => setEditingGoal(goal)}
            className="edit-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary-color)'
            }}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => deleteGoal(goal.id)}
            className="delete-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--error-color)'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="goal-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${goal.progress}%`,
              backgroundColor: getProgressColor(goal.progress)
            }}
          />
        </div>
        <span className="progress-text">{goal.progress}%</span>
      </div>
      
      <div className="goal-details">
        <span className="category">{goal.category}</span>
        {goal.deadline && (
          <span className="deadline">
            <Calendar size={14} />
            {new Date(goal.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <div className="progress-controls">
        <button
          onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
          className="progress-btn"
          style={{
            background: 'var(--secondary-color)',
            color: 'white',
            border: 'none',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          -10%
        </button>
        <button
          onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
          className="progress-btn"
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          +10%
        </button>
      </div>
    </div>
  )

  const renderInsights = () => {
    if (!insights || Object.keys(insights).length === 0) return null

    return (
      <div className="insights-section">
        <h3><Brain size={20} /> Goal Insights</h3>
        
        {insights.assessment && (
          <div className="insight-card">
            <h4>Progress Assessment</h4>
            <p>{insights.assessment.overallProgress}% overall progress</p>
            <div className="progress-summary">
              <div className="progress-item">
                <span>Completed: {insights.assessment.completedGoals || 0}</span>
              </div>
              <div className="progress-item">
                <span>In Progress: {insights.assessment.activeGoals || 0}</span>
              </div>
              <div className="progress-item">
                <span>Behind Schedule: {insights.assessment.behindSchedule || 0}</span>
              </div>
            </div>
          </div>
        )}
        
        {insights.predictions && (
          <div className="insight-card">
            <h4>Completion Predictions</h4>
            <ul>
              {insights.predictions.map((prediction, index) => (
                <li key={index}>{prediction}</li>
              ))}
            </ul>
          </div>
        )}
        
        {insights.blockers && (
          <div className="insight-card">
            <h4>Potential Blockers</h4>
            <ul>
              {insights.blockers.map((blocker, index) => (
                <li key={index}>
                  <strong>{blocker.issue}:</strong> {blocker.solution}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {insights.motivation && (
          <div className="insight-card motivation">
            <h4>💪 Motivation Boost</h4>
            <p>{insights.motivation}</p>
          </div>
        )}
      </div>
    )
  }

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null

    return (
      <div className="suggestions-section">
        <h3><Lightbulb size={20} /> Smart Suggestions</h3>
        <div className="suggestions-grid">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <h4>{suggestion.title}</h4>
                <span className={`suggestion-type ${suggestion.type}`}>
                  {suggestion.type}
                </span>
              </div>
              <p>{suggestion.description}</p>
              <button
                onClick={() => handleSuggestionAction(suggestion.action)}
                className="action-btn"
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Take Action <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleSuggestionAction = (action) => {
    switch (action) {
      case 'break_down_goals':
        // Implement goal breakdown logic
        console.log('Breaking down goals...')
        break
      case 'focus_deadlines':
        // Implement deadline focus logic
        console.log('Focusing on deadlines...')
        break
      case 'diversify_goals':
        // Implement goal diversification logic
        console.log('Diversifying goals...')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  return (
    <div className="goal-tracker">
      <div className="goal-header">
        <h2><Target size={24} /> Intelligent Goal Tracker</h2>
        <p>Track your goals with AI-powered insights and smart recommendations</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>{goals.length}</h3>
          <p>Active Goals</p>
        </div>
        <div className="stat-card">
          <h3>{goals.filter(g => g.progress === 100).length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / Math.max(goals.length, 1))}%</h3>
          <p>Avg Progress</p>
        </div>
        <div className="stat-card">
          <h3>{goals.filter(g => g.priority === 'high').length}</h3>
          <p>High Priority</p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="goals-section">
        <div className="section-header">
          <h3>Your Goals</h3>
          <button
            onClick={() => setShowGoalModal(true)}
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
            Add Goal
          </button>
        </div>

        <div className="goals-grid">
          {goals.map(renderGoalCard)}
        </div>
      </div>

      {/* Insights */}
      {renderInsights()}

      {/* Suggestions */}
      {renderSuggestions()}

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Goal</h3>
              <button
                onClick={() => setShowGoalModal(false)}
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
                <label>Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  <option value="personal">Personal</option>
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="financial">Financial</option>
                  <option value="learning">Learning</option>
                  <option value="relationships">Relationships</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Deadline (optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={createGoal}
                  className="create-btn"
                  disabled={!newGoal.category || !newGoal.description}
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        
        .stat-card h3 {
          margin: 0;
          font-size: 2rem;
          color: var(--primary-color);
        }
        
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .goal-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .goal-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
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
        
        .goal-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .goal-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--light-color);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-weight: bold;
          min-width: 40px;
        }
        
        .goal-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: var(--secondary-color);
        }
        
        .progress-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .insights-section, .suggestions-section {
          margin-top: 2rem;
        }
        
        .insight-card, .suggestion-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .suggestion-type {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .suggestion-type.progress {
          background: var(--warning-color);
          color: white;
        }
        
        .suggestion-type.deadline {
          background: var(--error-color);
          color: white;
        }
        
        .suggestion-type.balance {
          background: var(--primary-color);
          color: white;
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
        
        .form-group input, .form-group select, .form-group textarea {
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
      `}</style>
    </div>
  )
}

export default GoalTracker 