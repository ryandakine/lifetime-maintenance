import React from 'react'
import { Loader, Skeleton } from 'lucide-react'

// Main Loading Spinner
export const LoadingSpinner = ({ size = 40, color = '#1a3d2f', text = 'Loading...' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{
      width: size,
      height: size,
      border: `4px solid #f3f3f3`,
      borderTop: `4px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    {text && (
      <p style={{ color, fontSize: '1.1rem', margin: 0 }}>{text}</p>
    )}
  </div>
)

// Component Loading Spinner
export const ComponentLoader = ({ componentName, height = '200px' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height,
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
    <p style={{ color: '#1a3d2f', fontSize: '0.9rem', margin: 0 }}>
      Loading {componentName}...
    </p>
  </div>
)

// Skeleton Loading Components
export const TaskSkeleton = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    marginBottom: '0.5rem'
  }}>
    <div style={{
      width: '16px',
      height: '16px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}></div>
    <div style={{
      width: '20px',
      height: '20px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}></div>
    <div style={{
      flex: 1,
      height: '16px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}></div>
    <div style={{
      width: '60px',
      height: '16px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}></div>
  </div>
)

export const CardSkeleton = ({ height = '120px' }) => (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '1rem',
    height,
    animation: 'pulse 1.5s ease-in-out infinite'
  }}>
    <div style={{
      width: '60%',
      height: '20px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      marginBottom: '0.5rem'
    }}></div>
    <div style={{
      width: '100%',
      height: '16px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      marginBottom: '0.25rem'
    }}></div>
    <div style={{
      width: '80%',
      height: '16px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px'
    }}></div>
  </div>
)

export const ListSkeleton = ({ count = 5 }) => (
  <div>
    {Array.from({ length: count }).map((_, index) => (
      <TaskSkeleton key={index} />
    ))}
  </div>
)

// Progress Bar
export const ProgressBar = ({ progress = 0, total = 100, label = 'Loading...' }) => {
  const percentage = Math.min((progress / total) * 100, 100)
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: '#1a3d2f',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>
    </div>
  )
}

// Inline Loading
export const InlineLoader = ({ size = 16, color = '#1a3d2f' }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}>
    <div style={{
      width: size,
      height: size,
      border: `2px solid #f3f3f3`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
)

// Global Styles for animations
export const LoadingStyles = () => (
  <style jsx>{`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}</style>
) 