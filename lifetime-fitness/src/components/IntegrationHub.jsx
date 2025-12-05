import React, { useState } from 'react'
import './IntegrationHub.css'

const IntegrationHub = () => {
  const [scConfig, setScConfig] = useState({
    clientId: '',
    clientSecret: '',
    apiKey: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = (e) => {
    e.preventDefault()
    setIsConnecting(true)
    // Simulate connection attempt
    setTimeout(() => {
      setIsConnecting(false)
      alert('Connection failed: Invalid API Credentials. Please contact Lifetime Fitness IT for access.')
    }, 2000)
  }

  return (
    <div className="integration-hub" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #00509E 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '15px',
        marginBottom: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🔗 Service Channel Integration</h1>
        <p style={{ fontSize: '1.4rem', opacity: 0.9 }}>
          Enterprise Facility Management Synchronization
        </p>
      </div>

      {/* Main Connection Card */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '40px',
        marginBottom: '40px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            marginRight: '20px'
          }}>
            🏢
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>Service Channel Connection</h2>
            <div style={{
              display: 'inline-block',
              background: '#FFF3E0',
              color: '#FF9800',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginTop: '5px'
            }}>
              ⚠️ Pending Configuration
            </div>
          </div>
        </div>

        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Connect your Lifetime Fitness Maintenance System directly to Service Channel.
          This integration enables real-time synchronization of:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ background: '#F5F9FF', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>📋 Work Orders</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Auto-create and update work orders bi-directionally.</p>
          </div>
          <div style={{ background: '#F5F9FF', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>📦 Inventory</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Real-time parts availability and automated reordering.</p>
          </div>
          <div style={{ background: '#F5F9FF', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>💰 Invoicing</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Seamless invoice generation and approval workflows.</p>
          </div>
        </div>

        <form onSubmit={handleConnect} style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>API Client ID</label>
            <input
              type="text"
              placeholder="Enter Service Channel Client ID"
              value={scConfig.clientId}
              onChange={e => setScConfig({ ...scConfig, clientId: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>API Client Secret</label>
            <input
              type="password"
              placeholder="Enter Service Channel Client Secret"
              value={scConfig.clientSecret}
              onChange={e => setScConfig({ ...scConfig, clientSecret: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>API Key (Ocp-Apim-Subscription-Key)</label>
            <input
              type="password"
              placeholder="Enter Subscription Key"
              value={scConfig.apiKey}
              onChange={e => setScConfig({ ...scConfig, apiKey: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isConnecting}
            style={{
              background: isConnecting ? '#ccc' : '#00509E',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'background 0.3s'
            }}
          >
            {isConnecting ? 'Verifying Credentials...' : 'Connect to Service Channel'}
          </button>
        </form>
      </div>

      {/* Other Integrations Footer */}
      <div style={{ textAlign: 'center', opacity: 0.7 }}>
        <h3 style={{ color: '#666', marginBottom: '20px' }}>Other Available Connectors</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 16px', background: '#eee', borderRadius: '20px', color: '#555' }}>Life Fitness</span>
          <span style={{ padding: '8px 16px', background: '#eee', borderRadius: '20px', color: '#555' }}>Precor</span>
          <span style={{ padding: '8px 16px', background: '#eee', borderRadius: '20px', color: '#555' }}>Matrix</span>
          <span style={{ padding: '8px 16px', background: '#eee', borderRadius: '20px', color: '#555' }}>Technogym</span>
        </div>
      </div>

    </div>
  )
}

export default IntegrationHub