import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { store } from './store'
import './App.css'

// Lazy load components for code splitting
const Maintenance = lazy(() => import('./components/Maintenance'))
const OffDays = lazy(() => import('./components/OffDays'))
const VoiceAssistant = lazy(() => import('./components/VoiceAssistant'))
const SmartAssistant = lazy(() => import('./components/SmartAssistant'))

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #1a3d2f',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#1a3d2f', fontSize: '1.1rem' }}>Loading Lifetime Maintenance...</p>
  </div>
)

// Navigation Component
const Navigation = ({ isMobile }) => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Work Days', icon: '🏢' },
    { path: '/off-days', label: 'Off Days', icon: '🏠' }
  ]
  
  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1a3d2f 0%, #007BFF 100%)',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <h1 style={{
            margin: 0,
            color: 'white',
            fontSize: isMobile ? '1.2rem' : '1.5rem'
          }}>
            Lifetime Management
          </h1>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: isMobile ? '0.9rem' : '1rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

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
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          color: 'var(--error-color)'
        }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Service Worker registration for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  return (
    <Provider store={store}>
      <div className="App">
        {/* Offline Alert */}
        {showOfflineAlert && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ff6b6b',
            color: 'white',
            padding: '0.5rem',
            textAlign: 'center',
            zIndex: 1000,
            fontSize: '0.9rem'
          }}>
            ⚠️ You're offline. Some features may be limited.
          </div>
        )}

        {/* Mobile Navigation Hint */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            backgroundColor: '#1a3d2f',
            color: 'white',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'pulse 2s infinite'
          }}>
            🎤
          </div>
        )}

        {/* Main Content */}
        <Router>
          <div style={{
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto',
            padding: isMobile ? '0.5rem' : '2rem',
            minHeight: '100vh'
          }}>
            {/* Navigation */}
            <Navigation isMobile={isMobile} />
            
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Maintenance isMobile={isMobile} />} />
                <Route path="/off-days" element={<OffDays />} />
              </Routes>
              <VoiceAssistant isMobile={isMobile} />
              <SmartAssistant isMobile={isMobile} />
            </Suspense>
          </div>
        </Router>

        {/* Global Styles */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
<<<<<<< Updated upstream
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
            <Route path="/" element={<VoiceAssistant />} />
            <Route path="*" element={<VoiceAssistant />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
=======
    </Provider>
>>>>>>> Stashed changes
  )
}

export default App 