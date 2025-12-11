import React, { useEffect } from 'react'
import { useToast } from '../../context/ToastContext'

export default function Toast() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="toast-container" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px'
        }}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onClose }) {
    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success': return '#4CAF50'
            case 'error': return '#f44336'
            case 'warning': return '#FF9800'
            case 'info': return '#2196F3'
            default: return '#333'
        }
    }

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return '✓'
            case 'error': return '✕'
            case 'warning': return '⚠'
            case 'info': return 'ℹ'
            default: return '•'
        }
    }

    return (
        <div
            className={`toast ${toast.type}`}
            style={{
                background: getBackgroundColor(),
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '250px',
                animation: 'slideIn 0.3s ease-out'
            }}
        >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{getIcon()}</span>
            <span style={{ flex: 1, fontSize: '14px' }}>{toast.message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0 4px',
                    opacity: 0.7
                }}
            >
                ×
            </button>

            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .toast-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
        </div>
    )
}
