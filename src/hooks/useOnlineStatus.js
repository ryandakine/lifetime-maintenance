import { useState, useEffect } from 'react'

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastOnline, setLastOnline] = useState(Date.now())
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(Date.now())
      console.log('🟢 Back online')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('🔴 Gone offline')
    }

    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        setConnectionType(navigator.connection.effectiveType || 'unknown')
      }
    }

    // Set initial connection type
    if ('connection' in navigator) {
      setConnectionType(navigator.connection.effectiveType || 'unknown')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  const getConnectionQuality = () => {
    if (!isOnline) return 'offline'
    if (connectionType === '4g') return 'excellent'
    if (connectionType === '3g') return 'good'
    if (connectionType === '2g') return 'poor'
    return 'unknown'
  }

  const getOfflineDuration = () => {
    if (isOnline) return 0
    return Date.now() - lastOnline
  }

  return {
    isOnline,
    connectionType,
    connectionQuality: getConnectionQuality(),
    offlineDuration: getOfflineDuration(),
    lastOnline
  }
} 