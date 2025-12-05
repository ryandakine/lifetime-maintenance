import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const IntegrationHub = () => {
  const [integrations, setIntegrations] = useState({
    vendors: [],
    externalSystems: [],
    apis: [],
    webhooks: []
  })
  const [activeIntegrations, setActiveIntegrations] = useState([])
  const [connectionStatus, setConnectionStatus] = useState({})
  const [syncStatus, setSyncStatus] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks?.tasks || [])
  const equipment = useSelector(state => state.equipment?.equipment || [])

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setIsLoading(true)
    
    // Simulate API call for integrations
    setTimeout(() => {
      const mockIntegrations = generateMockIntegrations()
      setIntegrations(mockIntegrations)
      setActiveIntegrations(mockIntegrations.vendors.filter(v => v.isActive))
      setIsLoading(false)
    }, 1000)
  }

  const generateMockIntegrations = () => {
    return {
      vendors: [
        {
          id: 'vendor_001',
          name: 'Life Fitness',
          type: 'equipment_vendor',
          status: 'connected',
          isActive: true,
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          apiKey: 'lf_****_****_****',
          endpoints: ['equipment_catalog', 'parts_inventory', 'warranty_info'],
          syncFrequency: 'hourly',
          dataTypes: ['equipment', 'parts', 'warranties']
        },
        {
          id: 'vendor_002',
          name: 'Precor',
          type: 'equipment_vendor',
          status: 'connected',
          isActive: true,
          lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          apiKey: 'pc_****_****_****',
          endpoints: ['equipment_catalog', 'maintenance_schedules'],
          syncFrequency: 'daily',
          dataTypes: ['equipment', 'maintenance']
        },
        {
          id: 'vendor_003',
          name: 'Matrix Fitness',
          type: 'equipment_vendor',
          status: 'disconnected',
          isActive: false,
          lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          apiKey: 'mx_****_****_****',
          endpoints: ['equipment_catalog'],
          syncFrequency: 'weekly',
          dataTypes: ['equipment']
        }
      ],
      externalSystems: [
        {
          id: 'system_001',
          name: 'CMMS Pro',
          type: 'maintenance_management',
          status: 'connected',
          isActive: true,
          lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          apiKey: 'cmms_****_****_****',
          endpoints: ['work_orders', 'inventory', 'reports'],
          syncFrequency: 'realtime',
          dataTypes: ['tasks', 'inventory', 'reports']
        },
        {
          id: 'system_002',
          name: 'Facility Manager',
          type: 'facility_management',
          status: 'connected',
          isActive: true,
          lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          apiKey: 'fm_****_****_****',
          endpoints: ['facility_data', 'space_management'],
          syncFrequency: 'hourly',
          dataTypes: ['facility', 'space']
        }
      ],
      apis: [
        {
          id: 'api_001',
          name: 'Weather API',
          type: 'weather_service',
          status: 'connected',
          isActive: true,
          lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          apiKey: 'weather_****_****_****',
          endpoints: ['current_weather', 'forecast'],
          syncFrequency: '15min',
          dataTypes: ['weather']
        },
        {
          id: 'api_002',
          name: 'Parts Supplier API',
          type: 'parts_supplier',
          status: 'connected',
          isActive: true,
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          apiKey: 'parts_****_****_****',
          endpoints: ['inventory', 'pricing', 'availability'],
          syncFrequency: 'hourly',
          dataTypes: ['parts', 'pricing']
        }
      ],
      webhooks: [
        {
          id: 'webhook_001',
          name: 'Equipment Alerts',
          type: 'equipment_monitoring',
          status: 'active',
          isActive: true,
          lastTriggered: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          endpoint: 'https://api.lifetime-maintenance.com/webhooks/equipment',
          events: ['equipment_failure', 'maintenance_due', 'warranty_expiry'],
          secret: 'wh_****_****_****'
        },
        {
          id: 'webhook_002',
          name: 'Task Updates',
          type: 'task_management',
          status: 'active',
          isActive: true,
          lastTriggered: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          endpoint: 'https://api.lifetime-maintenance.com/webhooks/tasks',
          events: ['task_created', 'task_completed', 'task_assigned'],
          secret: 'wh_****_****_****'
        }
      ]
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'active':
        return '#4CAF50'
      case 'connecting':
        return '#FF9800'
      case 'disconnected':
      case 'inactive':
        return '#F44336'
      default:
        return '#757575'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'active':
        return '🟢'
      case 'connecting':
        return '🟡'
      case 'disconnected':
      case 'inactive':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const handleConnect = async (integration) => {
    setConnectionStatus(prev => ({ ...prev, [integration.id]: 'connecting' }))
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [integration.id]: 'connected' }))
      setActiveIntegrations(prev => [...prev, integration])
    }, 2000)
  }

  const handleDisconnect = async (integration) => {
    setConnectionStatus(prev => ({ ...prev, [integration.id]: 'disconnecting' }))
    
    // Simulate disconnection process
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [integration.id]: 'disconnected' }))
      setActiveIntegrations(prev => prev.filter(i => i.id !== integration.id))
    }, 1000)
  }

  const handleSync = async (integration) => {
    setSyncStatus(prev => ({ ...prev, [integration.id]: 'syncing' }))
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, [integration.id]: 'completed' }))
      // Reset sync status after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[integration.id]
          return newStatus
        })
      }, 3000)
    }, 1500)
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading integrations...
      </div>
    )
  }

  return (
    <div className="integration-hub" style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔗 Integration Hub</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Connect with external systems, vendors, and third-party services
        </p>
      </div>

      {/* Integration Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '10px' }}>
            {activeIntegrations.length}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Active Integrations
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            {integrations.vendors.length + integrations.externalSystems.length + integrations.apis.length} total available
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#2196F3', marginBottom: '10px' }}>
            {integrations.webhooks.filter(w => w.isActive).length}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Active Webhooks
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            Real-time data streaming
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#FF9800', marginBottom: '10px' }}>
            {Object.keys(syncStatus).length}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Syncing Now
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            Data synchronization in progress
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#9C27B0', marginBottom: '10px' }}>
            {integrations.vendors.length + integrations.externalSystems.length + integrations.apis.length}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Total Integrations
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            Available for connection
          </div>
        </div>
      </div>

      {/* Vendor Integrations */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🏭 Equipment Vendors
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {integrations.vendors.map(vendor => (
            <div key={vendor.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px',
              background: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {vendor.name}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {vendor.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusIcon(vendor.status)}
                    {vendor.status.toUpperCase()}
                  </span>
                  
                  {vendor.isActive && (
                    <span style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>Last Sync:</strong>
                  <div style={{ color: '#666' }}>
                    {vendor.lastSync.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Sync Frequency:</strong>
                  <div style={{ color: '#666' }}>{vendor.syncFrequency}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Data Types:</strong>
                  <div style={{ color: '#666' }}>
                    {vendor.dataTypes.join(', ')}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Endpoints:</strong>
                  <div style={{ color: '#666' }}>
                    {vendor.endpoints.length} available
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {vendor.isActive ? (
                  <>
                    <button
                      onClick={() => handleSync(vendor)}
                      disabled={syncStatus[vendor.id] === 'syncing'}
                      style={{
                        background: syncStatus[vendor.id] === 'syncing' ? '#ccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: syncStatus[vendor.id] === 'syncing' ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {syncStatus[vendor.id] === 'syncing' ? 'Syncing...' : 'Sync Now'}
                    </button>
                    
                    <button
                      onClick={() => handleDisconnect(vendor)}
                      style={{
                        background: '#F44336',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(vendor)}
                    disabled={connectionStatus[vendor.id] === 'connecting'}
                    style={{
                      background: connectionStatus[vendor.id] === 'connecting' ? '#ccc' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: connectionStatus[vendor.id] === 'connecting' ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {connectionStatus[vendor.id] === 'connecting' ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                
                <button style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Configure
                </button>
                
                <button style={{
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  View Data
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Systems */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🔧 External Systems
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {integrations.externalSystems.map(system => (
            <div key={system.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px',
              background: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {system.name}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {system.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusIcon(system.status)}
                    {system.status.toUpperCase()}
                  </span>
                  
                  {system.isActive && (
                    <span style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>Last Sync:</strong>
                  <div style={{ color: '#666' }}>
                    {system.lastSync.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Sync Frequency:</strong>
                  <div style={{ color: '#666' }}>{system.syncFrequency}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Data Types:</strong>
                  <div style={{ color: '#666' }}>
                    {system.dataTypes.join(', ')}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Endpoints:</strong>
                  <div style={{ color: '#666' }}>
                    {system.endpoints.length} available
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handleSync(system)}
                  disabled={syncStatus[system.id] === 'syncing'}
                  style={{
                    background: syncStatus[system.id] === 'syncing' ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: syncStatus[system.id] === 'syncing' ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {syncStatus[system.id] === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
                
                <button style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Configure
                </button>
                
                <button style={{
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  View Data
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🔗 Webhooks
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {integrations.webhooks.map(webhook => (
            <div key={webhook.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px',
              background: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {webhook.name}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {webhook.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusIcon(webhook.status)}
                    {webhook.status.toUpperCase()}
                  </span>
                  
                  {webhook.isActive && (
                    <span style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>Last Triggered:</strong>
                  <div style={{ color: '#666' }}>
                    {webhook.lastTriggered.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Endpoint:</strong>
                  <div style={{ color: '#666', fontSize: '12px', wordBreak: 'break-all' }}>
                    {webhook.endpoint}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Events:</strong>
                  <div style={{ color: '#666' }}>
                    {webhook.events.join(', ')}
                  </div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Secret:</strong>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {webhook.secret}
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Test Webhook
                </button>
                
                <button style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Configure
                </button>
                
                <button style={{
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntegrationHub 