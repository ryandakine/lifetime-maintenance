import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ErrorBoundary from './components/ErrorBoundary'
import Tasks from './components/Tasks'
import Shopping from './components/Shopping'
import Maintenance from './components/Maintenance'
import OffDays from './components/OffDays'
import Photos from './components/Photos'
import Knowledge from './components/Knowledge'
import Email from './components/Email'
import SmartAssistant from './components/SmartAssistant'
import GoalTracker from './components/GoalTracker'
import WorkoutTracker from './components/WorkoutTracker'
import TaskAutomation from './components/TaskAutomation'
import GitHubIntegration from './components/GitHubIntegration'
import FileUploader from './components/FileUploader'
import VoiceAssistant from './components/VoiceAssistant'
import LoadingStates from './components/LoadingStates'
import Toast from './components/Toast'
import { useTheme } from './hooks/useTheme'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('tasks')
  const { theme, toggleTheme } = useTheme()
  const { isOnline, connectionQuality } = useOnlineStatus()
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onTabChange: setActiveTab,
    onThemeToggle: toggleTheme
  })

  const tabs = [
    { id: 'tasks', label: '📋 Tasks', icon: '📋' },
    { id: 'shopping', label: '🛒 Shopping', icon: '🛒' },
    { id: 'maintenance', label: '🔧 Maintenance', icon: '🔧' },
    { id: 'offdays', label: '📅 Off Days', icon: '📅' },
    { id: 'photos', label: '📸 Photos', icon: '📸' },
    { id: 'knowledge', label: '🧠 Knowledge', icon: '🧠' },
    { id: 'email', label: '📧 Email', icon: '📧' },
    { id: 'smart-assistant', label: '🤖 Smart Assistant', icon: '🤖' },
    { id: 'goals', label: '🎯 Goals', icon: '🎯' },
    { id: 'workout', label: '💪 Workout', icon: '💪' },
    { id: 'automation', label: '⚡ Automation', icon: '⚡' },
    { id: 'github', label: '🐙 GitHub', icon: '🐙' },
    { id: 'files', label: '📁 Files', icon: '📁' },
    { id: 'voice', label: '🎤 Voice', icon: '🎤' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <Tasks />
      case 'shopping':
        return <Shopping />
      case 'maintenance':
        return <Maintenance />
      case 'offdays':
        return <OffDays />
      case 'photos':
        return <Photos />
      case 'knowledge':
        return <Knowledge />
      case 'email':
        return <Email />
      case 'smart-assistant':
        return <SmartAssistant />
      case 'goals':
        return <GoalTracker />
      case 'workout':
        return <WorkoutTracker />
      case 'automation':
        return <TaskAutomation />
      case 'github':
        return <GitHubIntegration />
      case 'files':
        return <FileUploader />
      case 'voice':
        return <VoiceAssistant />
      default:
        return <Tasks />
    }
  }

  return (
    <ErrorBoundary>
      <div className={`app ${theme}`}>
        <Toast />
        
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              🎯 Lifetime Maintenance App
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
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <LoadingStates>
            {renderTabContent()}
          </LoadingStates>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <p className="footer-text">
              Lifetime Maintenance App - Built with React & Redux
            </p>
            <div className="footer-links">
              <span className="footer-link">Version 1.0.0</span>
              <span className="footer-link">•</span>
              <span className="footer-link">Enhanced Voice Assistant</span>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App 