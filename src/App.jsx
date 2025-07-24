import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Maintenance from './components/Maintenance'
import Email from './components/Email'
import Tasks from './components/Tasks'
import Shopping from './components/Shopping'
import Photos from './components/Photos'
import VoiceAssistant from './components/VoiceAssistant'
import './App.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught: ', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--danger-color)',
          backgroundColor: 'var(--light-color)',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page or go back to the main page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Route Diagnostics Component
function RouteDiagnostics() {
  const location = useLocation()
  useEffect(() => {
    console.log("Rendering route: " + location.pathname)
  }, [location.pathname])
  return null
}

// Simple WorkoutTracker Component
function WorkoutTracker() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      color: 'var(--primary-color)',
      backgroundColor: 'var(--light-color)',
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <h2>Workout Tracker Loaded</h2>
      <p>This is a placeholder for the workout tracker feature.</p>
    </div>
  )
}

// Test Render Component for root path
function TestRender() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      color: 'var(--primary-color)',
      backgroundColor: 'var(--light-color)',
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <h2>Test Render</h2>
      <p>This is the root path test render.</p>
      <div style={{ marginTop: '1rem' }}>
        <a 
          href="/maintenance" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '0.5rem'
          }}
        >
          Go to Maintenance
        </a>
        <a 
          href="/tasks" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '0.5rem'
          }}
        >
          Go to Tasks
        </a>
        <a 
          href="/shopping" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '0.5rem'
          }}
        >
          Go to Shopping
        </a>
        <a 
          href="/email" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '0.5rem'
          }}
        >
          Go to Email
        </a>
        <a 
          href="/photos" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '0.5rem'
          }}
        >
          Go to Photos
        </a>
        <a 
          href="/voice" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Voice Assistant
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <RouteDiagnostics />
        <div className="App">
          <Routes>
            <Route path="/" element={<TestRender />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/email" element={<Email />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/workout-tracker" element={<WorkoutTracker />} />
            <Route path="*" element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: 'var(--danger-color)',
                backgroundColor: 'var(--light-color)',
                borderRadius: '8px',
                margin: '1rem'
              }}>
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <a 
                  href="/" 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Back to Home
                </a>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App 