import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Maintenance from './components/Maintenance'
import Email from './components/Email'
import Tasks from './components/Tasks'
import Shopping from './components/Shopping'
import Photos from './components/Photos'
import VoiceAssistant from './components/VoiceAssistant'
import Knowledge from './components/Knowledge'
import FileUploader from './components/FileUploader'
import { supabase, API_KEYS } from './lib/supabase'
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
          color: '#007BFF',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2>Error: Check console</h2>
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
    console.log("Navigating to " + location.pathname)
  }, [location.pathname])
  return null
}

// Simple WorkoutTracker Component
function WorkoutTracker() {
  console.log('Rendering WorkoutTracker')
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

// Debug Status Component
function DebugStatus() {
  const [debugInfo, setDebugInfo] = React.useState({
    supabaseConnected: false,
    apiKeysLoaded: {},
    offlineStatus: !navigator.onLine,
    browserInfo: {},
    routeInfo: {},
    errors: []
  })
  const [testResults, setTestResults] = React.useState([])
  const [testing, setTesting] = React.useState(false)

  React.useEffect(() => {
    const checkStatus = async () => {
      const info = {
        supabaseConnected: false,
        apiKeysLoaded: {
          PERPLEXITY_PRO: API_KEYS.PERPLEXITY_PRO !== 'your-perplexity-key',
          CLAUDE_API: API_KEYS.CLAUDE_API !== 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          ANTHROPIC: API_KEYS.ANTHROPIC !== 'your-anthropic-key',
          GROK_PRO: API_KEYS.GROK_PRO !== 'your-grok-key',
          RESEND: API_KEYS.RESEND !== 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        },
        offlineStatus: !navigator.onLine,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          platform: navigator.platform
        },
        routeInfo: {
          location: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname
        },
        errors: []
      }

      // Test Supabase connection
      try {
        const { data, error } = await supabase.from('tasks').select('count').limit(1)
        info.supabaseConnected = !error
        if (error) {
          info.errors.push(`Supabase: ${error.message}`)
        }
      } catch (error) {
        info.errors.push(`Supabase connection failed: ${error.message}`)
      }

      setDebugInfo(info)
    }

    checkStatus()
    
    const handleOnline = () => setDebugInfo(prev => ({ ...prev, offlineStatus: false }))
    const handleOffline = () => setDebugInfo(prev => ({ ...prev, offlineStatus: true }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const testSupabaseConnection = async () => {
    setTesting(true)
    const results = []
    
    try {
      // Test basic connection
      console.log('🧪 Testing Supabase connection...')
      results.push({ test: 'Connection Test', status: 'Starting', time: new Date().toISOString() })
      
      // Test tasks table
      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').limit(3)
      if (tasksError) {
        console.error('Tasks table error:', tasksError)
        results.push({ test: 'Tasks Table', status: 'Error', error: tasksError.message, time: new Date().toISOString() })
      } else {
        console.log('Tasks table success:', tasksData)
        results.push({ test: 'Tasks Table', status: 'Success', data: `${tasksData?.length || 0} records`, time: new Date().toISOString() })
      }
      
      // Test shopping_lists table
      const { data: shoppingData, error: shoppingError } = await supabase.from('shopping_lists').select('*').limit(3)
      if (shoppingError) {
        console.error('Shopping lists table error:', shoppingError)
        results.push({ test: 'Shopping Lists Table', status: 'Error', error: shoppingError.message, time: new Date().toISOString() })
      } else {
        console.log('Shopping lists table success:', shoppingData)
        results.push({ test: 'Shopping Lists Table', status: 'Success', data: `${shoppingData?.length || 0} records`, time: new Date().toISOString() })
      }
      
      // Test emails table
      const { data: emailsData, error: emailsError } = await supabase.from('emails').select('*').limit(3)
      if (emailsError) {
        console.error('Emails table error:', emailsError)
        results.push({ test: 'Emails Table', status: 'Error', error: emailsError.message, time: new Date().toISOString() })
      } else {
        console.log('Emails table success:', emailsData)
        results.push({ test: 'Emails Table', status: 'Success', data: `${emailsData?.length || 0} records`, time: new Date().toISOString() })
      }
      
      // Test knowledge table
      const { data: knowledgeData, error: knowledgeError } = await supabase.from('knowledge').select('*').limit(3)
      if (knowledgeError) {
        console.error('Knowledge table error:', knowledgeError)
        results.push({ test: 'Knowledge Table', status: 'Error', error: knowledgeError.message, time: new Date().toISOString() })
      } else {
        console.log('Knowledge table success:', knowledgeData)
        results.push({ test: 'Knowledge Table', status: 'Success', data: `${knowledgeData?.length || 0} records`, time: new Date().toISOString() })
      }
      
      console.log('🧪 Supabase tests completed:', results)
      
    } catch (error) {
      console.error('Supabase test failed:', error)
      results.push({ test: 'Connection Test', status: 'Failed', error: error.message, time: new Date().toISOString() })
    }
    
    setTestResults(results)
    setTesting(false)
  }

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'left', 
      color: '#007BFF',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '1rem',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ color: '#007BFF', marginBottom: '2rem' }}>🔧 App Debug Status</h2>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#007BFF' }}>🌐 Connection Status</h3>
          <div>Supabase: <span style={{ color: debugInfo.supabaseConnected ? 'green' : 'red' }}>
            {debugInfo.supabaseConnected ? '✅ Connected' : '❌ Disconnected'}
          </span></div>
          <div>Online: <span style={{ color: debugInfo.offlineStatus ? 'red' : 'green' }}>
            {debugInfo.offlineStatus ? '❌ Offline' : '✅ Online'}
          </span></div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#007BFF' }}>🔑 API Keys Status</h3>
          {Object.entries(debugInfo.apiKeysLoaded).map(([key, loaded]) => (
            <div key={key}>{key}: <span style={{ color: loaded ? 'green' : 'orange' }}>
              {loaded ? '✅ Loaded' : '⚠️ Default/Missing'}
            </span></div>
          ))}
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#007BFF' }}>🌍 Browser Info</h3>
          <div>Platform: {debugInfo.browserInfo.platform}</div>
          <div>Language: {debugInfo.browserInfo.language}</div>
          <div>Cookies: {debugInfo.browserInfo.cookieEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
          <div>User Agent: {debugInfo.browserInfo.userAgent?.substring(0, 50)}...</div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#007BFF' }}>📍 Route Info</h3>
          <div>Current URL: {debugInfo.routeInfo.location}</div>
          <div>Origin: {debugInfo.routeInfo.origin}</div>
          <div>Path: {debugInfo.routeInfo.pathname}</div>
        </div>

        {debugInfo.errors.length > 0 && (
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Errors</h3>
            {debugInfo.errors.map((error, index) => (
              <div key={index} style={{ color: '#856404' }}>• {error}</div>
            ))}
          </div>
        )}

        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#007BFF' }}>🧪 Test Actions</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <a href="/tasks" style={{ padding: '0.5rem 1rem', backgroundColor: '#007BFF', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Tasks</a>
            <a href="/shopping" style={{ padding: '0.5rem 1rem', backgroundColor: '#007BFF', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Shopping</a>
            <a href="/emails" style={{ padding: '0.5rem 1rem', backgroundColor: '#007BFF', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Emails</a>
            <a href="/knowledge" style={{ padding: '0.5rem 1rem', backgroundColor: '#007BFF', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Knowledge</a>
            <a href="/voice" style={{ padding: '0.5rem 1rem', backgroundColor: '#007BFF', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Voice</a>
          </div>
          <button
            onClick={testSupabaseConnection}
            disabled={testing}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: testing ? '#6c757d' : '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: testing ? 'not-allowed' : 'pointer'
            }}
          >
            {testing ? '🔄 Testing Supabase...' : '🧪 Test Supabase Connection'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#007BFF' }}>📊 Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} style={{ 
                margin: '0.5rem 0', 
                padding: '0.5rem',
                backgroundColor: result.status === 'Success' ? '#d4edda' : result.status === 'Error' || result.status === 'Failed' ? '#f8d7da' : '#fff3cd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {result.status === 'Success' ? '✅' : result.status === 'Error' || result.status === 'Failed' ? '❌' : '⏳'} {result.test}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Status: {result.status} 
                  {result.data && ` | Data: ${result.data}`}
                  {result.error && ` | Error: ${result.error}`}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999' }}>
                  {new Date(result.time).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Test Render Component for root path
function TestRender() {
  console.log('Rendering TestRender')
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: '#007BFF',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '1rem',
      fontWeight: 'bold',
      fontSize: '2rem'
    }}>
      Test Render
    </div>
  )
}

function App() {
  console.log('Rendering App')
  return (
    <ErrorBoundary>
      <Router>
        <RouteDiagnostics />
        <div className="App">
          <Routes>
            <Route path="/" element={<TestRender />} />
            <Route path="/test" element={<TestRender />} />
            <Route path="/maintenance" element={
              <ErrorBoundary>
                <Maintenance />
              </ErrorBoundary>
            } />
            <Route path="/email" element={
              <ErrorBoundary>
                <Email />
              </ErrorBoundary>
            } />
            <Route path="/emails" element={
              <ErrorBoundary>
                <Email />
              </ErrorBoundary>
            } />
            <Route path="/tasks" element={
              <ErrorBoundary>
                <Tasks />
              </ErrorBoundary>
            } />
            <Route path="/shopping" element={
              <ErrorBoundary>
                <Shopping />
              </ErrorBoundary>
            } />
            <Route path="/photos" element={
              <ErrorBoundary>
                <Photos />
              </ErrorBoundary>
            } />
            <Route path="/voice" element={
              <ErrorBoundary>
                <VoiceAssistant />
              </ErrorBoundary>
            } />
            <Route path="/knowledge" element={
              <ErrorBoundary>
                <Knowledge />
              </ErrorBoundary>
            } />
            <Route path="/files" element={
              <ErrorBoundary>
                <FileUploader />
              </ErrorBoundary>
            } />
            <Route path="/debug" element={<DebugStatus />} />
            <Route path="/workout-tracker" element={<WorkoutTracker />} />
            <Route path="*" element={<div style={{ color: '#007BFF' }}>Test Render</div>} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App 