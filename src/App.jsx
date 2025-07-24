import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Maintenance from './components/Maintenance'
import Email from './components/Email'
import Tasks from './components/Tasks'
import Shopping from './components/Shopping'
import Photos from './components/Photos'
import './App.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught: ", error)
    console.error("Error info: ", errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#007BFF',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message || 'Unknown error'}</p>
          <a href="/" style={{ color: '#007BFF', textDecoration: 'underline' }}>
            Back to Home
          </a>
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
      color: '#007BFF',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Workout Tracker Loaded</h1>
      <p>This is a placeholder for the workout tracker feature.</p>
      <a href="/" style={{ color: '#007BFF', textDecoration: 'underline' }}>
        Back to Home
      </a>
    </div>
  )
}

// Test Render Component for root path
function TestRender() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      color: '#007BFF',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Test Render</h1>
      <p>This confirms the app is rendering correctly.</p>
      <a href="/maintenance" style={{ color: '#007BFF', textDecoration: 'underline' }}>
        Go to Maintenance
      </a>
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
            <Route path="/workout-tracker" element={<WorkoutTracker />} />
            <Route path="*" element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#007BFF',
                fontFamily: 'Arial, sans-serif'
              }}>
                <h1>Page Not Found</h1>
                <p>Route: {window.location.pathname}</p>
                <a href="/" style={{ color: '#007BFF', textDecoration: 'underline' }}>
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