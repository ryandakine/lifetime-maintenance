import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, updateTask } from '../store/slices/tasksSlice'

const RealTimeCollaboration = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isTyping, setIsTyping] = useState({})
  const [collaborativeTasks, setCollaborativeTasks] = useState([])
  const [activeEditors, setActiveEditors] = useState({})
  const [userCursor, setUserCursor] = useState({})
  const [sessionId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [userName, setUserName] = useState(`Tech_${Math.floor(Math.random() * 1000)}`)
  
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks?.tasks || [])
  const messagesEndRef = useRef(null)
  const wsRef = useRef(null)

  // WebSocket connection for real-time features
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('wss://echo.websocket.org') // Using echo service for demo
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        // Send user join message
        ws.send(JSON.stringify({
          type: 'user_join',
          userId: sessionId,
          userName: userName,
          timestamp: new Date().toISOString()
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId, userName])

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'chat_message':
        setMessages(prev => [...prev, data])
        break
      case 'user_join':
        setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.userId), data])
        setMessages(prev => [...prev, {
          type: 'system',
          content: `${data.userName} joined the session`,
          timestamp: data.timestamp
        }])
        break
      case 'user_leave':
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId))
        setMessages(prev => [...prev, {
          type: 'system',
          content: `${data.userName} left the session`,
          timestamp: data.timestamp
        }])
        break
      case 'typing_start':
        setIsTyping(prev => ({ ...prev, [data.userId]: data.userName }))
        break
      case 'typing_stop':
        setIsTyping(prev => {
          const newTyping = { ...prev }
          delete newTyping[data.userId]
          return newTyping
        })
        break
      case 'task_update':
        handleCollaborativeTaskUpdate(data)
        break
      case 'cursor_move':
        setUserCursor(prev => ({ ...prev, [data.userId]: data.position }))
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current) return

    const messageData = {
      type: 'chat_message',
      userId: sessionId,
      userName: userName,
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    wsRef.current.send(JSON.stringify(messageData))
    setNewMessage('')
  }

  const handleTyping = (isTyping) => {
    if (!wsRef.current) return

    const typingData = {
      type: isTyping ? 'typing_start' : 'typing_stop',
      userId: sessionId,
      userName: userName,
      timestamp: new Date().toISOString()
    }

    wsRef.current.send(JSON.stringify(typingData))
  }

  const handleCollaborativeTaskUpdate = (data) => {
    // Update task in real-time
    if (data.taskId) {
      dispatch(updateTask({
        id: data.taskId,
        ...data.changes
      }))
    }
  }

  const startCollaborativeEditing = (taskId) => {
    setActiveEditors(prev => ({ ...prev, [taskId]: sessionId }))
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'start_editing',
        userId: sessionId,
        userName: userName,
        taskId: taskId,
        timestamp: new Date().toISOString()
      }))
    }
  }

  const stopCollaborativeEditing = (taskId) => {
    setActiveEditors(prev => {
      const newEditors = { ...prev }
      delete newEditors[taskId]
      return newEditors
    })
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_editing',
        userId: sessionId,
        userName: userName,
        taskId: taskId,
        timestamp: new Date().toISOString()
      }))
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="real-time-collaboration" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: '20px',
      height: 'calc(100vh - 200px)',
      padding: '20px'
    }}>
      {/* Main Collaboration Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🤝 Real-Time Collaboration</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              {onlineUsers.length} team members online
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#4CAF50',
              animation: 'pulse 2s infinite'
            }} />
            <span>Live</span>
          </div>
        </div>

        {/* Collaborative Task Management */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Collaborative Tasks</h3>
          
          <div style={{
            display: 'grid',
            gap: '10px'
          }}>
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                background: activeEditors[task.id] ? '#f0f8ff' : 'white',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ margin: 0, color: '#333' }}>{task.title}</h4>
                  <div style={{
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center'
                  }}>
                    {activeEditors[task.id] && (
                      <span style={{
                        fontSize: '12px',
                        color: '#2196F3',
                        fontWeight: 'bold'
                      }}>
                        🔒 Being edited
                      </span>
                    )}
                    <button
                      onClick={() => activeEditors[task.id] 
                        ? stopCollaborativeEditing(task.id)
                        : startCollaborativeEditing(task.id)
                      }
                      style={{
                        background: activeEditors[task.id] ? '#f44336' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {activeEditors[task.id] ? 'Stop Editing' : 'Start Editing'}
                    </button>
                  </div>
                </div>
                
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  {task.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  fontSize: '12px'
                }}>
                  <span style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {task.status}
                  </span>
                  <span style={{
                    background: '#fff3e0',
                    color: '#f57c00',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>💬 Team Chat</h3>
          
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            {messages.map((message, index) => (
              <div key={index} style={{
                marginBottom: '10px',
                padding: '10px',
                background: message.type === 'system' ? '#fff3cd' : 
                           message.userId === sessionId ? '#d4edda' : 'white',
                borderRadius: '8px',
                borderLeft: message.type === 'system' ? '4px solid #ffc107' :
                           message.userId === sessionId ? '4px solid #28a745' : '4px solid #007bff'
              }}>
                {message.type === 'system' ? (
                  <div style={{ textAlign: 'center', color: '#856404', fontSize: '12px' }}>
                    {message.content}
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <strong style={{ color: '#333' }}>
                        {message.userName}
                        {message.userId === sessionId && ' (You)'}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: '#333' }}>{message.content}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicators */}
          {Object.keys(isTyping).length > 0 && (
            <div style={{
              padding: '5px 10px',
              fontSize: '12px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              {Object.values(isTyping).join(', ')} {Object.keys(isTyping).length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          {/* Message Input */}
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping(e.target.value.length > 0)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage()
                }
              }}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Online Users & Activity */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Online Users */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>👥 Online Team</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {onlineUsers.map(user => (
              <div key={user.userId} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4CAF50'
                }} />
                <span style={{ fontWeight: '500', color: '#333' }}>
                  {user.userName}
                  {user.userId === sessionId && ' (You)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Live Activity</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '14px'
          }}>
            <div style={{
              padding: '10px',
              background: '#e8f5e8',
              borderRadius: '6px',
              borderLeft: '4px solid #4CAF50'
            }}>
              <strong>Task Updated</strong>
              <div style={{ color: '#666', fontSize: '12px' }}>
                Treadmill maintenance task modified by Tech_123
              </div>
            </div>
            
            <div style={{
              padding: '10px',
              background: '#fff3e0',
              borderRadius: '6px',
              borderLeft: '4px solid #FF9800'
            }}>
              <strong>Photo Uploaded</strong>
              <div style={{ color: '#666', fontSize: '12px' }}>
                New equipment photo added by Tech_456
              </div>
            </div>
            
            <div style={{
              padding: '10px',
              background: '#e3f2fd',
              borderRadius: '6px',
              borderLeft: '4px solid #2196F3'
            }}>
              <strong>Voice Command</strong>
              <div style={{ color: '#666', fontSize: '12px' }}>
                "Create task for elliptical repair" by Tech_789
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default RealTimeCollaboration 