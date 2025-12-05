import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, updateTask } from '../store/slices/tasksSlice'

const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isOffline, setIsOffline] = useState(false)
  const [offlineData, setOfflineData] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [location, setLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks?.tasks || [])
  const photos = useSelector(state => state.photos?.photos || [])

  useEffect(() => {
    checkOnlineStatus()
    setupLocationTracking()
    loadOfflineData()
    setupNotifications()
  }, [])

  const checkOnlineStatus = () => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()
  }

  const setupLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }

  const loadOfflineData = () => {
    const savedData = localStorage.getItem('mobileOfflineData')
    if (savedData) {
      setOfflineData(JSON.parse(savedData))
    }
  }

  const setupNotifications = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Simulate incoming notifications
      setInterval(() => {
        const mockNotifications = [
          'New maintenance task assigned',
          'Equipment alert: Treadmill T1 needs attention',
          'Photo analysis completed',
          'Team member joined your session'
        ]
        
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
        addNotification(randomNotification)
      }, 30000) // Every 30 seconds
    }
  }

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)])
  }

  const markNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const startQRScan = () => {
    setIsScanning(true)
    // Simulate QR code scanning
    setTimeout(() => {
      const mockResults = [
        { type: 'equipment', id: 'treadmill_001', name: 'Treadmill T1' },
        { type: 'task', id: 'task_123', name: 'Maintenance Task #123' },
        { type: 'location', id: 'gym_floor_1', name: 'Gym Floor 1' }
      ]
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setScanResult(randomResult)
      setIsScanning(false)
    }, 2000)
  }

  const handleVoiceCommand = (command) => {
    // Simulate voice command processing
    console.log('Voice command:', command)
    addNotification(`Voice command processed: "${command}"`)
  }

  const saveOfflineData = (data) => {
    const updatedData = [...offlineData, { ...data, timestamp: new Date() }]
    setOfflineData(updatedData)
    localStorage.setItem('mobileOfflineData', JSON.stringify(updatedData))
  }

  const syncOfflineData = async () => {
    setIsLoading(true)
    // Simulate sync process
    setTimeout(() => {
      setOfflineData([])
      localStorage.removeItem('mobileOfflineData')
      setIsLoading(false)
      addNotification('Offline data synced successfully')
    }, 2000)
  }

  const renderDashboard = () => (
    <div style={{ padding: '20px' }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        background: isOffline ? '#fff3cd' : '#d4edda',
        borderRadius: '10px',
        border: `2px solid ${isOffline ? '#ffc107' : '#28a745'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>
            {isOffline ? '📱' : '📶'}
          </span>
          <span style={{ fontWeight: 'bold' }}>
            {isOffline ? 'Offline Mode' : 'Online'}
          </span>
        </div>
        
        {isOffline && (
          <button
            onClick={syncOfflineData}
            disabled={isLoading}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Syncing...' : 'Sync'}
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <button
          onClick={startQRScan}
          disabled={isScanning}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '2rem' }}>
            {isScanning ? '⏳' : '📱'}
          </span>
          {isScanning ? 'Scanning...' : 'Scan QR Code'}
        </button>

        <button
          onClick={() => handleVoiceCommand('Take photo')}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '2rem' }}>📸</span>
          Take Photo
        </button>

        <button
          onClick={() => handleVoiceCommand('Create task')}
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '2rem' }}>✅</span>
          Create Task
        </button>

        <button
          onClick={() => setActiveTab('collaboration')}
          style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '2rem' }}>🤝</span>
          Team Chat
        </button>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Recent Activity</h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {tasks.slice(0, 3).map(task => (
            <div key={task.id} style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '10px',
              borderLeft: '4px solid #007bff'
            }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                {task.title}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {task.description}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px'
              }}>
                <span style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {task.status}
                </span>
                <span style={{
                  background: '#fff3e0',
                  color: '#f57c00',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Info */}
      {location && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📍 Current Location</h3>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Latitude: {location.lat.toFixed(6)}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Longitude: {location.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  )

  const renderNotifications = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>🔔 Notifications</h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            No notifications yet
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => markNotificationRead(notification.id)}
              style={{
                background: notification.read ? '#f8f9fa' : '#e3f2fd',
                padding: '15px',
                borderRadius: '10px',
                borderLeft: `4px solid ${notification.read ? '#ccc' : '#2196F3'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '5px'
              }}>
                <div style={{
                  fontWeight: notification.read ? 'normal' : 'bold',
                  color: '#333'
                }}>
                  {notification.message}
                </div>
                {!notification.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#2196F3'
                  }} />
                )}
              </div>
              <div style={{
                color: '#666',
                fontSize: '12px'
              }}>
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderOfflineData = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>💾 Offline Data</h2>
      
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            Pending Sync: {offlineData.length} items
          </span>
          <button
            onClick={syncOfflineData}
            disabled={isLoading || offlineData.length === 0}
            style={{
              background: offlineData.length === 0 ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: offlineData.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isLoading ? 'Syncing...' : 'Sync All'}
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {offlineData.map((item, index) => (
            <div key={index} style={{
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #007bff'
            }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                {item.type || 'Data Item'}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                {item.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderScanResult = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>📱 QR Scan Result</h2>
      
      {scanResult ? (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '4rem' }}>
              {scanResult.type === 'equipment' ? '🏃' :
               scanResult.type === 'task' ? '✅' : '📍'}
            </span>
          </div>
          
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {scanResult.name}
            </h3>
            <p style={{ margin: 0, color: '#666' }}>
              Type: {scanResult.type.toUpperCase()}
            </p>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              ID: {scanResult.id}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              View Details
            </button>
            
            <button style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Take Action
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          No scan result available
        </div>
      )}
      
      <button
        onClick={() => setScanResult(null)}
        style={{
          background: '#FF9800',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          marginTop: '20px',
          width: '100%'
        }}
      >
        Scan Again
      </button>
    </div>
  )

  return (
    <div className="mobile-app" style={{
      maxWidth: '400px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Mobile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📱 Mobile App</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
          Lifetime Fitness Maintenance
        </p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'offline' && renderOfflineData()}
        {activeTab === 'scan' && renderScanResult()}
      </div>

      {/* Mobile Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderTop: '1px solid #e0e0e0',
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: activeTab === 'dashboard' ? '#667eea' : '#666',
            fontSize: '12px'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🏠</span>
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: activeTab === 'notifications' ? '#667eea' : '#666',
            fontSize: '12px',
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🔔</span>
          Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {notifications.filter(n => !n.read).length}
            </div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: activeTab === 'offline' ? '#667eea' : '#666',
            fontSize: '12px'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>💾</span>
          Offline
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: activeTab === 'scan' ? '#667eea' : '#666',
            fontSize: '12px'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📱</span>
          Scan
        </button>
      </div>

      {/* Bottom padding for navigation */}
      <div style={{ height: '80px' }} />
    </div>
  )
}

export default MobileApp 