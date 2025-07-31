import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
// import LoadingStates from './components/LoadingStates'
// import Toast from './components/Toast'
import { useTheme } from './hooks/useTheme'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import './App.css'

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'))
const PersonalMaintenanceDashboard = lazy(() => import('./components/PersonalMaintenanceDashboard'))
const Tasks = lazy(() => import('./components/Tasks'))
const TasksKendo = lazy(() => import('./components/TasksKendo'))
const Shopping = lazy(() => import('./components/Shopping'))
const Maintenance = lazy(() => import('./components/Maintenance'))
const VisualMaintenance = lazy(() => import('./components/VisualMaintenance'))
          const Photos = lazy(() => import('./components/Photos'))
          const VoiceInput = lazy(() => import('./components/VoiceInput'))
          const Voice = lazy(() => import('./components/Voice'))
          const RealTimeCollaboration = lazy(() => import('./components/RealTimeCollaboration'))
          const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'))
          const IntegrationHub = lazy(() => import('./components/IntegrationHub'))
          const MobileApp = lazy(() => import('./components/MobileApp'))
          const AITraining = lazy(() => import('./components/AITraining'))

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme, toggleTheme } = useTheme()
  const { isOnline, connectionQuality } = useOnlineStatus()
  
  // Memoized keyboard shortcuts to prevent unnecessary re-renders
  const keyboardCallbacks = useMemo(() => ({
    onTabChange: setActiveTab,
    onThemeToggle: toggleTheme
  }), [toggleTheme])
  
  useKeyboardShortcuts(keyboardCallbacks)

  // Memoize tabs to prevent recreation on every render
  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'personal-dashboard', label: 'Your Dashboard', icon: '👤' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'tasks-pro', label: 'Tasks Pro', icon: '🔥' },
    { id: 'shopping', label: 'Shopping', icon: '🛒' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'visual-maintenance', label: 'Visual AI', icon: '📸' },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'voice', label: 'Voice', icon: '🎤' },
    { id: 'collaboration', label: 'Collaboration', icon: '🤝' },
    { id: 'advanced-analytics', label: 'Advanced Analytics', icon: '📈' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'mobile-app', label: 'Mobile App', icon: '📱' },
    { id: 'ai-training', label: 'AI Training', icon: '🤖' }
  ], [])

  // Memoized render function with Suspense for lazy loading
  const renderTabContent = useCallback(() => {
    const LoadingFallback = () => (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )

    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard />
        case 'personal-dashboard':
          return <PersonalMaintenanceDashboard />
        case 'tasks':
          return <Tasks />
        case 'tasks-pro':
          return <TasksKendo />
        case 'shopping':
          return <Shopping />
        case 'maintenance':
          return <Maintenance />
        case 'visual-maintenance':
          return <VisualMaintenance />
        case 'photos':
          return <Photos />
        case 'voice':
          return <Voice />
        case 'collaboration':
          return <RealTimeCollaboration />
        case 'advanced-analytics':
          return <AdvancedAnalytics />
        case 'integrations':
          return <IntegrationHub />
        case 'mobile-app':
          return <MobileApp />
        case 'ai-training':
          return <AITraining />
        default:
          return <Dashboard />
      }
    })()

    return (
      <Suspense fallback={<LoadingFallback />}>
        {content}
      </Suspense>
    )
  }, [activeTab])

  return (
    <ErrorBoundary>
      <div className={`app ${theme}`}>
        {/* <Toast /> */}
        
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              🏋️ Lifetime Fitness Maintenance
            </h1>
            
            <div className="header-controls">
              {/* Connection Status */}
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <span className="status-icon">
                  {isOnline ? '🌐' : '📡'}
                </span>
                <span className="status-text">
                  {isOnline ? connectionQuality : 'Offline'}
                </span>
              </div>

              {/* Theme Toggle */}
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                title="Toggle theme (Ctrl+T)"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="tab-navigation">
          <div className="tab-container">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={`${tab.label} (Ctrl+${tabs.indexOf(tab) + 1})`}
                aria-pressed={activeTab === tab.id}
                aria-label={`Switch to ${tab.label}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {/* <LoadingStates> */}
            {renderTabContent()}
          {/* </LoadingStates> */}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <p className="footer-text">
              Lifetime Fitness Maintenance - Powered by Workflows & Kendo UI
            </p>
            <div className="footer-links">
              <span className="footer-link">Version 2.0.0</span>
              <span className="footer-link">•</span>
              <span className="footer-link">Kendo UI Enhanced</span>
            </div>
          </div>
        </footer>

        {/* Voice Input - Always Available */}
        <VoiceInput />
      </div>
    </ErrorBoundary>
  )
}

export default App 