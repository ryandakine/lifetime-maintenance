import React from 'react'

export default function ExportButton({ equipment, logs, onExport }) {
    const handleExport = (format) => {
        if (onExport) {
            onExport(format)
        }
    }

    return (
        <div className="export-buttons" style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px'
        }}>
            <button
                onClick={() => handleExport('pdf')}
                style={{
                    padding: '8px 16px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                📄 Export PDF
            </button>
            <button
                onClick={() => handleExport('csv')}
                style={{
                    padding: '8px 16px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                📊 Export CSV
            </button>
        </div>
    )
}
