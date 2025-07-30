import React from 'react'

const TasksKendo = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🔥 Tasks Pro - Test</h1>
      <p>If you can see this, the component is loading!</p>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Simple Test Component</h3>
        <p>This is a basic test to see if the component loads without any Kendo UI imports.</p>
        <button 
          onClick={() => alert('Button works!')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  )
}

export default TasksKendo 