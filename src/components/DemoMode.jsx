import React from 'react'

export default function DemoMode() {
    return (
        <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            minHeight: '100vh',
            color: '#fff'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏋️ Demo Mode</h1>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                Experience the Facility Maintenance App without an account
            </p>

            <div style={{
                display: 'grid',
                gap: '1rem',
                maxWidth: '400px',
                margin: '0 auto'
            }}>
                <DemoCard
                    icon="📋"
                    title="Task Management"
                    desc="AI-powered task creation and tracking"
                />
                <DemoCard
                    icon="🛒"
                    title="Shopping Lists"
                    desc="Smart inventory and supply management"
                />
                <DemoCard
                    icon="📸"
                    title="Photo Documentation"
                    desc="Capture and organize maintenance photos"
                />
                <DemoCard
                    icon="🎤"
                    title="Voice Commands"
                    desc="Hands-free operation for busy techs"
                />
            </div>

            <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem' }}>
                Contact us to set up your facility's account
            </p>
        </div>
    )
}

function DemoCard({ icon, title, desc }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'left',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{title}</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{desc}</p>
        </div>
    )
}
