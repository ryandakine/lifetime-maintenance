import React, { useState, useCallback, useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import './Dashboard.css'

const Dashboard = memo(() => {
  const [workflowResults, setWorkflowResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Add safety check for Redux store
  const tasks = useSelector(state => {
    try {
      return state?.tasks?.tasks || []
    } catch (error) {
      console.warn('Error accessing tasks from Redux store:', error)
      return []
    }
  })

  const shoppingItems = useSelector(state => {
    try {
      const shopping = state?.shopping || {}
      return [...(shopping.mainList || []), ...(shopping.miscList || [])]
    } catch (error) {
      console.warn('Error accessing shopping items from Redux store:', error)
      return []
    }
  })

  // Memoized workflow trigger function
  const triggerWorkflow = useCallback(async (workflowType, data) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/n8n/${workflowType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()

      setWorkflowResults(prev => [...prev, {
        id: Date.now(),
        type: workflowType,
        data,
        result,
        timestamp: new Date().toISOString()
      }])

      return result
    } catch (error) {
      // console.error('Workflow error:', error)
      setWorkflowResults(prev => [...prev, {
        id: Date.now(),
        type: workflowType,
        data,
        error: error.message,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Memoized quick action handlers
  const handleEmailWorkflow = useCallback(async () => {
    const emailData = {
      topic: 'Maintenance Update',
      recipient: 'team@lifetimefitness.com',
      urgency: 'normal'
    }
    await triggerWorkflow('email-automation', emailData)
  }, [triggerWorkflow])

  const handleAIWorkflow = useCallback(async () => {
    const aiData = {
      message: 'What maintenance tasks should I prioritize today?',
      context: 'fitness-facility-maintenance'
    }
    await triggerWorkflow('ai-assistant', aiData)
  }, [triggerWorkflow])

  const handleTaskAnalysis = useCallback(async () => {
    const taskData = {
      description: 'Check treadmill maintenance schedule',
      priority: 'high',
      equipment: 'treadmill'
    }
    await triggerWorkflow('task-processing', taskData)
  }, [triggerWorkflow])

  const handlePhotoAnalysis = useCallback(async () => {
    const photoData = {
      description: 'Equipment damage assessment',
      category: 'equipment-maintenance'
    }
    await triggerWorkflow('photo-analysis', photoData)
  }, [triggerWorkflow])

  const handleShoppingAnalysis = useCallback(async () => {
    const shoppingData = {
      item: 'treadmill belt',
      quantity: 1,
      urgency: 'medium'
    }
    await triggerWorkflow('shopping-processing', shoppingData)
  }, [triggerWorkflow])

  // Memoized computed values for better performance
  const statusStats = useMemo(() => ({
    activeTasks: tasks?.length || 12, // Default to 12 for demo if empty
    shoppingItems: shoppingItems?.length || 5, // Default to 5 for demo if empty
    maintenanceDue: 3,
    photosDocumented: 28
  }), [tasks?.length, shoppingItems?.length])

  const recentWorkflows = useMemo(() =>
    workflowResults.slice(-5).reverse(),
    [workflowResults]
  )

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏋️ Executive Dashboard</h2>
        <p>Facility Performance & Maintenance Overview</p>
      </div>

      {/* Executive Metrics - The "Money Shot" */}
      <div className="status-overview" style={{ marginBottom: '30px' }}>
        <div className="status-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="status-card" style={{ borderLeft: '4px solid #4CAF50' }}>
            <h4>💰 YTD Savings</h4>
            <p className="status-number" style={{ color: '#4CAF50' }}>$12,450</p>
            <p className="status-label">Preventative Maintenance</p>
          </div>

          <div className="status-card" style={{ borderLeft: '4px solid #2196F3' }}>
            <h4>⚡ Equipment Uptime</h4>
            <p className="status-number" style={{ color: '#2196F3' }}>99.2%</p>
            <p className="status-label">Target: 99.0%</p>
          </div>

          <div className="status-card" style={{ borderLeft: '4px solid #9C27B0' }}>
            <h4>✅ SLA Compliance</h4>
            <p className="status-number" style={{ color: '#9C27B0' }}>98%</p>
            <p className="status-label">Response Time < 4h</p>
          </div>

          <div className="status-card" style={{ borderLeft: '4px solid #FF9800' }}>
            <h4>🔧 Open Work Orders</h4>
            <p className="status-number" style={{ color: '#FF9800' }}>{statusStats.activeTasks}</p>
            <p className="status-label">3 High Priority</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-grid">
          <button
            className="action-button"
            onClick={handleEmailWorkflow}
            disabled={isLoading}
          >
            📧 Send Report
          </button>

          <button
            className="action-button"
            onClick={handleAIWorkflow}
            disabled={isLoading}
          >
            🤖 AI Insight
          </button>

          <button
            className="action-button"
            onClick={handleTaskAnalysis}
            disabled={isLoading}
          >
            📋 Create Task
          </button>

          <button
            className="action-button"
            onClick={handlePhotoAnalysis}
            disabled={isLoading}
          >
            📸 Scan Part
          </button>

          <button
            className="action-button"
            onClick={handleShoppingAnalysis}
            disabled={isLoading}
          >
            🛒 Order Supplies
          </button>
        </div>
      </div>

      {/* Workflow Results */}
      <div className="workflow-results">
        <h3>🔄 System Activity</h3>
        {workflowResults.length === 0 ? (
          <p className="no-results">System ready. Waiting for input...</p>
        ) : (
          <div className="results-list">
            {recentWorkflows.map(result => (
              <div key={result.id} className={`result-item ${result.error ? 'error' : 'success'}`}>
                <div className="result-header">
                  <span className="result-type">{result.type}</span>
                  <span className="result-time">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="result-content">
                  {result.error ? (
                    <p className="error-message">❌ {result.error}</p>
                  ) : (
                    <p className="success-message">✅ Action completed successfully</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  )
})

Dashboard.displayName = 'Dashboard'

export default Dashboard