import React, { useState, useCallback, useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import './Dashboard.css'

const Dashboard = memo(() => {
  const [workflowResults, setWorkflowResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const tasks = useSelector(state => state.tasks.tasks)
  const shoppingItems = useSelector(state => state.shopping.items)

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
    activeTasks: tasks.length,
    shoppingItems: shoppingItems.length,
    maintenanceDue: 5, // This could be computed from actual maintenance data
    photosDocumented: 12 // This could be computed from actual photo data
  }), [tasks.length, shoppingItems.length])

  const recentWorkflows = useMemo(() => 
    workflowResults.slice(-5).reverse(),
    [workflowResults]
  )

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏋️ Maintenance Dashboard</h2>
        <p>Quick access to maintenance workflows and status</p>
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
            📧 Send Email
          </button>
          
          <button 
            className="action-button"
            onClick={handleAIWorkflow}
            disabled={isLoading}
          >
            🤖 AI Assistant
          </button>
          
          <button 
            className="action-button"
            onClick={handleTaskAnalysis}
            disabled={isLoading}
          >
            📋 Analyze Task
          </button>
          
          <button 
            className="action-button"
            onClick={handlePhotoAnalysis}
            disabled={isLoading}
          >
            📸 Photo Analysis
          </button>
          
          <button 
            className="action-button"
            onClick={handleShoppingAnalysis}
            disabled={isLoading}
          >
            🛒 Shopping Analysis
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <h3>📊 Status Overview</h3>
        <div className="status-grid">
          <div className="status-card">
            <h4>📋 Tasks</h4>
            <p className="status-number">{statusStats.activeTasks}</p>
            <p className="status-label">Active Tasks</p>
          </div>
          
          <div className="status-card">
            <h4>🛒 Shopping</h4>
            <p className="status-number">{statusStats.shoppingItems}</p>
            <p className="status-label">Items Needed</p>
          </div>
          
          <div className="status-card">
            <h4>🔧 Maintenance</h4>
            <p className="status-number">{statusStats.maintenanceDue}</p>
            <p className="status-label">Due This Week</p>
          </div>
          
          <div className="status-card">
            <h4>📸 Photos</h4>
            <p className="status-number">{statusStats.photosDocumented}</p>
            <p className="status-label">Documented</p>
          </div>
        </div>
      </div>

      {/* Workflow Results */}
      <div className="workflow-results">
        <h3>🔄 Recent Workflows</h3>
        {workflowResults.length === 0 ? (
          <p className="no-results">No workflows triggered yet. Use the quick actions above to get started!</p>
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
                    <p className="success-message">✅ Workflow completed successfully</p>
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
          <p>Processing workflow...</p>
        </div>
      )}
    </div>
  )
})

Dashboard.displayName = 'Dashboard'

export default Dashboard