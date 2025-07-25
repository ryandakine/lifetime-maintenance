import React, { useState, useImperativeHandle, forwardRef, Suspense, lazy } from 'react'
import './Maintenance.css'

// Lazy load components for code splitting
const Tasks = lazy(() => import('./Tasks'))
const Shopping = lazy(() => import('./Shopping'))
const Knowledge = lazy(() => import('./Knowledge'))
const Email = lazy(() => import('./Email'))
const Photos = lazy(() => import('./Photos'))
const FileUploader = lazy(() => import('./FileUploader'))
const TaskAutomation = lazy(() => import('./TaskAutomation'))
const GitHubIntegration = lazy(() => import('./GitHubIntegration'))

// Loading component for component-level Suspense
const ComponentLoader = ({ componentName }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    flexDirection: 'column',
    gap: '0.5rem'
  }}>
    <div style={{
      width: '30px',
      height: '30px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #1a3d2f',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#1a3d2f', fontSize: '0.9rem' }}>Loading {componentName}...</p>
  </div>
)

const Maintenance = forwardRef(({ isMobile = false }, ref) => {
  const [activeTab, setActiveTab] = useState('tasks')
  const [componentRefs, setComponentRefs] = useState({})

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    switchToTab: (tabName) => setActiveTab(tabName),
    getActiveTab: () => activeTab,
    // Expose methods from child components
    createTask: (taskData) => {
      if (componentRefs.tasks && componentRefs.tasks.createTask) {
        return componentRefs.tasks.createTask(taskData)
      }
    },
    addShoppingItem: (itemData) => {
      if (componentRefs.shopping && componentRefs.shopping.addItem) {
        return componentRefs.shopping.addItem(itemData)
      }
    },
    searchKnowledge: (query) => {
      if (componentRefs.knowledge && componentRefs.knowledge.search) {
        return componentRefs.knowledge.search(query)
      }
    },
    sendEmail: (emailData) => {
      if (componentRefs.email && componentRefs.email.sendEmail) {
        return componentRefs.email.sendEmail(emailData)
      }
    },
    uploadPhoto: (photoData) => {
      if (componentRefs.photos && componentRefs.photos.uploadPhoto) {
        return componentRefs.photos.uploadPhoto(photoData)
      }
    }
  }))

  const tabs = [
    { id: 'tasks', name: 'Tasks', icon: '📋' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'knowledge', name: 'Knowledge', icon: '📚' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'photos', name: 'Photos', icon: '📸' },
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'automation', name: 'Automation', icon: '⚡' },
    { id: 'github', name: 'GitHub', icon: '🐙' }
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  const renderComponent = () => {
    const commonProps = { 
      ref: (el) => {
        if (el) {
          setComponentRefs(prev => ({ ...prev, [activeTab]: el }))
        }
      },
      isMobile 
    }

    switch (activeTab) {
      case 'tasks':
        return (
          <Suspense fallback={<ComponentLoader componentName="Tasks" />}>
            <Tasks {...commonProps} />
          </Suspense>
        )
      case 'shopping':
        return (
          <Suspense fallback={<ComponentLoader componentName="Shopping" />}>
            <Shopping {...commonProps} />
          </Suspense>
        )
      case 'knowledge':
        return (
          <Suspense fallback={<ComponentLoader componentName="Knowledge" />}>
            <Knowledge {...commonProps} />
          </Suspense>
        )
      case 'email':
        return (
          <Suspense fallback={<ComponentLoader componentName="Email" />}>
            <Email {...commonProps} />
          </Suspense>
        )
      case 'photos':
        return (
          <Suspense fallback={<ComponentLoader componentName="Photos" />}>
            <Photos {...commonProps} />
          </Suspense>
        )
      case 'files':
        return (
          <Suspense fallback={<ComponentLoader componentName="Files" />}>
            <FileUploader {...commonProps} />
          </Suspense>
        )
      case 'automation':
        return (
          <Suspense fallback={<ComponentLoader componentName="Task Automation" />}>
            <TaskAutomation {...commonProps} />
          </Suspense>
        )
      case 'github':
        return (
          <Suspense fallback={<ComponentLoader componentName="GitHub Integration" />}>
            <GitHubIntegration {...commonProps} />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<ComponentLoader componentName="Tasks" />}>
            <Tasks {...commonProps} />
          </Suspense>
        )
    }
  }

  return (
    <div className="maintenance-container">
      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        overflowX: 'auto',
        backgroundColor: '#1a3d2f',
        borderRadius: '8px 8px 0 0',
        padding: isMobile ? '0.5rem' : '1rem',
        gap: isMobile ? '0.5rem' : '1rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeTab === tab.id ? '#bfc1c2' : 'transparent',
              color: activeTab === tab.id ? '#1a3d2f' : '#fff',
              cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              minWidth: 'fit-content'
            }}
          >
            <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content" style={{
        backgroundColor: '#fff',
        borderRadius: '0 0 8px 8px',
        minHeight: '70vh',
        padding: isMobile ? '1rem' : '2rem'
      }}>
        {renderComponent()}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .tab-navigation::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
})

Maintenance.displayName = 'Maintenance'

export default Maintenance 