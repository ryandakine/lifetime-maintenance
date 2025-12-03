import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
    const [show, setShow] = useState(true)

    useEffect(() => {
        // Show splash for 2 seconds
        const timer = setTimeout(() => {
            setShow(false)
            if (onFinish) onFinish()
        }, 2000)

        return () => clearTimeout(timer)
    }, [onFinish])

    if (!show) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#1a1a2e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeOut 0.5s ease-out 1.5s forwards'
        }}>
            <img
                src="/cimco-logo.png"
                alt="Cimco Resources"
                style={{
                    maxWidth: '300px',
                    width: '80%',
                    marginBottom: '30px',
                    animation: 'fadeIn 0.8s ease-in'
                }}
            />
            <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(255,255,255,0.2)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
