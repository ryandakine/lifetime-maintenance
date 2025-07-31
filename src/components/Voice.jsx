import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask } from '../store/slices/tasksSlice'
import { addShoppingItem } from '../store/slices/shoppingSlice'

const Voice = () => {
  const [voiceHistory, setVoiceHistory] = useState([])
  const [trainingData, setTrainingData] = useState([])
  const [voiceStats, setVoiceStats] = useState({
    totalCommands: 0,
    successRate: 0,
    averageConfidence: 0,
    mostUsedCommands: []
  })
  const [isTraining, setIsTraining] = useState(false)
  const [customCommands, setCustomCommands] = useState([])
  
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks?.tasks || [])
  const shoppingItems = useSelector(state => {
    const shopping = state.shopping || {}
    return [...(shopping.mainList || []), ...(shopping.miscList || [])]
  })

  // Voice command examples and training
  const voiceExamples = [
    {
      category: 'Navigation',
      commands: [
        'go to dashboard',
        'show me the tasks',
        'open photos section',
        'switch to shopping list'
      ]
    },
    {
      category: 'Task Management',
      commands: [
        'create task fix treadmill belt',
        'mark task as complete',
        'delete task number five',
        'add high priority task'
      ]
    },
    {
      category: 'Shopping',
      commands: [
        'add oil filter to shopping list',
        'buy new treadmill belt',
        'purchase cleaning supplies',
        'add to shopping list'
      ]
    },
    {
      category: 'Photo Documentation',
      commands: [
        'take photo of equipment',
        'capture image of damage',
        'document this issue',
        'photo the broken part'
      ]
    },
    {
      category: 'Maintenance',
      commands: [
        'check equipment status',
        'schedule maintenance for treadmill',
        'report broken equipment',
        'log maintenance issue'
      ]
    }
  ]

  // Voice command statistics
  useEffect(() => {
    const stats = {
      totalCommands: voiceHistory.length,
      successRate: voiceHistory.length > 0 
        ? (voiceHistory.filter(cmd => cmd.success).length / voiceHistory.length * 100).toFixed(1)
        : 0,
      averageConfidence: voiceHistory.length > 0
        ? (voiceHistory.reduce((sum, cmd) => sum + (cmd.confidence || 0), 0) / voiceHistory.length * 100).toFixed(1)
        : 0,
      mostUsedCommands: getMostUsedCommands()
    }
    setVoiceStats(stats)
  }, [voiceHistory])

  const getMostUsedCommands = () => {
    const commandCounts = {}
    voiceHistory.forEach(cmd => {
      const action = cmd.action || 'unknown'
      commandCounts[action] = (commandCounts[action] || 0) + 1
    })
    
    return Object.entries(commandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }))
  }

  // Add custom command
  const addCustomCommand = (command, action) => {
    const newCommand = {
      id: Date.now(),
      command,
      action,
      created: new Date().toISOString()
    }
    setCustomCommands(prev => [...prev, newCommand])
  }

  // Voice training interface
  const startTraining = () => {
    setIsTraining(true)
    // This would typically open a training interface
    console.log('Starting voice training...')
  }

  // Export voice data
  const exportVoiceData = () => {
    const data = {
      voiceHistory,
      trainingData,
      customCommands,
      stats: voiceStats,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'voice-data-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="voice-page" style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎤 Voice-First Interface</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Hands-free operation through advanced voice recognition and AI-powered natural language processing
        </p>
      </div>

      {/* Voice Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '10px' }}>
            {voiceStats.totalCommands}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Commands</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#2196F3', marginBottom: '10px' }}>
            {voiceStats.successRate}%
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Success Rate</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#FF9800', marginBottom: '10px' }}>
            {voiceStats.averageConfidence}%
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Avg Confidence</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#9C27B0', marginBottom: '10px' }}>
            {customCommands.length}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Custom Commands</div>
        </div>
      </div>

      {/* Voice Command Examples */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🎯 Voice Command Examples
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {voiceExamples.map(category => (
            <div key={category.category} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                marginBottom: '15px',
                color: '#2196F3',
                borderBottom: '2px solid #2196F3',
                paddingBottom: '5px'
              }}>
                {category.category}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {category.commands.map((command, index) => (
                  <li key={index} style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '0.95rem',
                    color: '#666'
                  }}>
                    <span style={{ color: '#333', fontWeight: '500' }}>"{command}"</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Voice History */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '1.8rem', color: '#333' }}>📝 Voice Command History</h2>
          <button
            onClick={exportVoiceData}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Export Data
          </button>
        </div>

        {voiceHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎤</div>
            <p>No voice commands recorded yet.</p>
            <p>Start using voice commands to see your history here!</p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {voiceHistory.slice(-10).reverse().map((cmd, index) => (
              <div key={index} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                background: cmd.success ? '#f8fff8' : '#fff8f8'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    "{cmd.command}"
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'right'
                  }}>
                    {new Date(cmd.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Action: <span style={{ fontWeight: '500' }}>{cmd.action || 'Unknown'}</span>
                  {cmd.confidence && (
                    <span style={{ marginLeft: '15px' }}>
                      Confidence: <span style={{ fontWeight: '500' }}>{Math.round(cmd.confidence * 100)}%</span>
                    </span>
                  )}
                </div>
                {cmd.success !== undefined && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: cmd.success ? '#4CAF50' : '#f44336',
                    fontWeight: '500'
                  }}>
                    {cmd.success ? '✅ Success' : '❌ Failed'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Commands */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          ⚙️ Custom Voice Commands
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            border: '2px dashed #e0e0e0',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>➕</div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>Add Custom Command</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
              Create your own voice commands for specific actions
            </p>
            <button
              onClick={() => addCustomCommand('example command', 'example_action')}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Add Example
            </button>
          </div>

          {customCommands.map(cmd => (
            <div key={cmd.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '15px',
              background: '#f9f9f9'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                "{cmd.command}"
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                Action: {cmd.action}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                Created: {new Date(cmd.created).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Training */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🎓 Voice Training & Improvement
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: '#e3f2fd',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #2196F3'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>🎯 Accuracy Training</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
              Improve voice recognition accuracy by training with your specific accent and speaking patterns.
            </p>
            <button
              onClick={startTraining}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Start Training
            </button>
          </div>

          <div style={{
            background: '#f3e5f5',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #9C27B0'
          }}>
            <h3 style={{ color: '#7b1fa2', marginBottom: '10px' }}>🔧 Command Optimization</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
              Analyze your voice command patterns and optimize for better recognition.
            </p>
            <button
              style={{
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Analyze Patterns
            </button>
          </div>

          <div style={{
            background: '#e8f5e8',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #4CAF50'
          }}>
            <h3 style={{ color: '#388e3c', marginBottom: '10px' }}>📊 Performance Analytics</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
              View detailed analytics about your voice command usage and success rates.
            </p>
            <button
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Most Used Commands */}
      {voiceStats.mostUsedCommands.length > 0 && (
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
            📈 Most Used Commands
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {voiceStats.mostUsedCommands.map((cmd, index) => (
              <div key={index} style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                  {cmd.count}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {cmd.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          ⚡ Quick Voice Actions
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <button
            onClick={() => dispatch(addTask({
              id: Date.now(),
              title: 'Voice-created task',
              description: 'Quick task created via voice interface',
              status: 'pending',
              priority: 'medium',
              category: 'voice',
              creation_date: new Date().toISOString()
            }))}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🎤 Create Quick Task
          </button>

          <button
            onClick={() => dispatch(addShoppingItem({
              id: Date.now(),
              name: 'Voice-added item',
              category: 'voice',
              quantity: 1,
              priority: 'medium'
            }))}
            style={{
              background: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🛒 Add Shopping Item
          </button>

          <button
            onClick={() => window.location.hash = '#photos'}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            📸 Open Photo Capture
          </button>

          <button
            onClick={() => window.location.hash = '#tasks'}
            style={{
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            📋 View All Tasks
          </button>
        </div>
      </div>
    </div>
  )
}

export default Voice 