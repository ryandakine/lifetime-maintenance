import React, { useState, useEffect } from 'react'
import '../industrial-theme.css'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }) {
    const [visible, setVisible] = useState(true)
    const [fading, setFading] = useState(false)
    const [messageIndex, setMessageIndex] = useState(0)
    const [readyToEnter, setReadyToEnter] = useState(false)

    const loadingMessages = [
        "Initializing Mesh Network...",
        "Syncing Equipment Telemetry...",
        "Verifying Safety Protocols...",
        "Calibrating AI Health Models...",
        "Connecting to Sterling HQ..."
    ]

    useEffect(() => {
        // Cycle through messages
        const interval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % loadingMessages.length)
        }, 800)

        // After 3 seconds, allow entry
        const timer = setTimeout(() => {
            setReadyToEnter(true)
            clearInterval(interval)
        }, 3000)

        return () => {
            clearTimeout(timer)
            clearInterval(interval)
        }
    }, [])

    const handleEnter = () => {
        if (!readyToEnter) return
        setFading(true)
        setTimeout(() => {
            setVisible(false)
            onFinish()
        }, 500)
    }

    if (!visible) return null

    return (
        <div
            className={`splash-screen ${fading ? 'fade-out' : ''}`}
            onClick={handleEnter}
            style={{ cursor: readyToEnter ? 'pointer' : 'default' }}
        >
            <div className="splash-content">
                <div className="logo-container">
                    <img src="/cimco-logo-official.png" alt="Cimco Resources" className="splash-logo" />
                    {!readyToEnter && <div className="gear-spinner"></div>}
                </div>
                <h1 className="splash-title">Equipment Tracker</h1>
                <p className="splash-subtitle">Cimco Resources System</p>

                <div className="loading-message-container">
                    {!readyToEnter ? (
                        <p className="loading-message">{loadingMessages[messageIndex]}</p>
                    ) : (
                        <div className="enter-button-container">
                            <button className="enter-button">
                                Tap to Enter System
                            </button>
                        </div>
                    )}
                </div>

                <div className="splash-footer">
                    <p>v1.0.4 • Enterprise Edition</p>
                </div>
            </div>
        </div>
    )
}
