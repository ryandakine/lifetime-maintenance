import React from 'react'

// Memoized Task Template Component
const TaskTemplate = React.memo(({ template, onSelect, isMobile }) => {
    const handleClick = () => {
        if (onSelect) {
            onSelect(template)
        }
    }

    return (
        <button
            onClick={handleClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: isMobile ? '120px' : '150px',
                textAlign: 'center'
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
            }}
        >
            <div style={{ fontSize: '2rem' }}>{template.icon || '📋'}</div>
            <div style={{ fontWeight: '600', color: '#212529' }}>{template.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{template.description}</div>
        </button>
    )
})

TaskTemplate.displayName = 'TaskTemplate'

export default TaskTemplate
