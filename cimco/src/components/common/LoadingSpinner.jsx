import React from 'react'

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="loading-spinner-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: '#666'
        }}>
            <div className="gear-spinner"></div>
            <p style={{ marginTop: '15px', fontWeight: '500' }}>{message}</p>
        </div>
    )
}
