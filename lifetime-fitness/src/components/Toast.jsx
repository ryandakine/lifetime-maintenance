import React, { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = React.createContext()

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(toast.id), 300) // Wait for animation
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.id, onRemove])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  }

  const colors = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '#10b981' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#ef4444' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '#f59e0b' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: '#3b82f6' }
  }

  const color = colors[toast.type] || colors.info

  return (
    <div
      style={{
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div style={{ color: color.icon, flexShrink: 0, marginTop: '2px' }}>
        {icons[toast.type]}
      </div>
      
      <div style={{ flex: 1 }}>
        {toast.title && (
          <h4 style={{
            margin: '0 0 0.25rem 0',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: color.text
          }}>
            {toast.title}
          </h4>
        )}
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: color.text,
          lineHeight: '1.4'
        }}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: color.icon,
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, ...options })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Hook for easy toast usage
export const useToastNotifications = () => {
  const toast = useToast()
  
  return {
    showSuccess: (message, title) => toast.success(message, { title }),
    showError: (message, title) => toast.error(message, { title }),
    showWarning: (message, title) => toast.warning(message, { title }),
    showInfo: (message, title) => toast.info(message, { title }),
    showLoading: (message, title) => toast.addToast({ 
      type: 'info', 
      message, 
      title, 
      duration: Infinity 
    }),
    dismiss: toast.removeToast,
    clear: toast.clearToasts
  }
}

// Default export - the ToastProvider for easy importing
const Toast = ToastProvider

export default Toast 