import React from 'react'

export default function Breadcrumbs({ path = [] }) {
    if (path.length === 0) return null

    return (
        <nav className="breadcrumbs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            color: '#666',
            borderBottom: '1px solid #e0e0e0',
            background: '#fafafa'
        }}>
            {path.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span style={{ color: '#999' }}>›</span>}
                    <span
                        onClick={item.onClick}
                        style={{
                            color: index === path.length - 1 ? '#333' : '#2196F3',
                            cursor: item.onClick ? 'pointer' : 'default',
                            fontWeight: index === path.length - 1 ? '500' : '400'
                        }}
                    >
                        {item.label}
                    </span>
                </React.Fragment>
            ))}
        </nav>
    )
}
