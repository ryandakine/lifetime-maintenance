import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const AITraining = () => {
  const [trainingData, setTrainingData] = useState([])
  const [modelPerformance, setModelPerformance] = useState({})
  const [userFeedback, setUserFeedback] = useState([])
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState('equipment_recognition')
  const [feedbackForm, setFeedbackForm] = useState({
    photoId: '',
    prediction: '',
    actualResult: '',
    confidence: 0,
    feedback: ''
  })

  const dispatch = useDispatch()
  const photos = useSelector(state => state.photos?.photos || [])
  const tasks = useSelector(state => state.tasks?.tasks || [])

  useEffect(() => {
    loadAITrainingData()
  }, [])

  const loadAITrainingData = async () => {
    // Simulate loading AI training data
    const mockTrainingData = generateMockTrainingData()
    const mockModelPerformance = generateMockModelPerformance()
    const mockUserFeedback = generateMockUserFeedback()
    
    setTrainingData(mockTrainingData)
    setModelPerformance(mockModelPerformance)
    setUserFeedback(mockUserFeedback)
  }

  const generateMockTrainingData = () => {
    return [
      {
        id: 'train_001',
        photoId: 'photo_001',
        photoUrl: 'https://via.placeholder.com/150',
        originalPrediction: 'Treadmill',
        actualResult: 'Treadmill',
        confidence: 0.89,
        isCorrect: true,
        trainingStatus: 'used',
        addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'train_002',
        photoId: 'photo_002',
        photoUrl: 'https://via.placeholder.com/150',
        originalPrediction: 'Elliptical',
        actualResult: 'Treadmill',
        confidence: 0.76,
        isCorrect: false,
        trainingStatus: 'pending',
        addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'train_003',
        photoId: 'photo_003',
        photoUrl: 'https://via.placeholder.com/150',
        originalPrediction: 'Weight Machine',
        actualResult: 'Weight Machine',
        confidence: 0.94,
        isCorrect: true,
        trainingStatus: 'used',
        addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]
  }

  const generateMockModelPerformance = () => {
    return {
      equipment_recognition: {
        accuracy: 87.3,
        precision: 89.1,
        recall: 85.7,
        f1Score: 87.4,
        totalSamples: 1247,
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        improvement: 2.3
      },
      damage_detection: {
        accuracy: 92.1,
        precision: 91.8,
        recall: 92.5,
        f1Score: 92.2,
        totalSamples: 892,
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        improvement: 1.7
      },
      maintenance_prediction: {
        accuracy: 78.9,
        precision: 81.2,
        recall: 76.5,
        f1Score: 78.8,
        totalSamples: 567,
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        improvement: 4.2
      }
    }
  }

  const generateMockUserFeedback = () => {
    return [
      {
        id: 'feedback_001',
        photoId: 'photo_001',
        userRating: 5,
        feedback: 'Excellent equipment recognition!',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        model: 'equipment_recognition',
        processed: true
      },
      {
        id: 'feedback_002',
        photoId: 'photo_002',
        userRating: 2,
        feedback: 'Wrong equipment type detected',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        model: 'equipment_recognition',
        processed: false
      },
      {
        id: 'feedback_003',
        photoId: 'photo_003',
        userRating: 4,
        feedback: 'Good damage detection, but missed some minor issues',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        model: 'damage_detection',
        processed: true
      }
    ]
  }

  const startModelTraining = async () => {
    setIsTraining(true)
    setTrainingProgress(0)
    
    // Simulate training process
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const submitFeedback = () => {
    if (!feedbackForm.photoId || !feedbackForm.feedback) return
    
    const newFeedback = {
      id: `feedback_${Date.now()}`,
      photoId: feedbackForm.photoId,
      userRating: feedbackForm.confidence,
      feedback: feedbackForm.feedback,
      timestamp: new Date(),
      model: selectedModel,
      processed: false
    }
    
    setUserFeedback(prev => [newFeedback, ...prev])
    setFeedbackForm({
      photoId: '',
      prediction: '',
      actualResult: '',
      confidence: 0,
      feedback: ''
    })
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return '#4CAF50'
    if (score >= 80) return '#8BC34A'
    if (score >= 70) return '#FF9800'
    return '#F44336'
  }

  const getTrainingStatusColor = (status) => {
    switch (status) {
      case 'used': return '#4CAF50'
      case 'pending': return '#FF9800'
      case 'rejected': return '#F44336'
      default: return '#757575'
    }
  }

  return (
    <div className="ai-training" style={{
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
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🤖 AI Training Center</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Improve AI models with user feedback and training data
        </p>
      </div>

      {/* Model Performance Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(modelPerformance).map(([modelName, performance]) => (
          <div key={modelName} style={{
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', textTransform: 'capitalize' }}>
              {modelName.replace('_', ' ')} Model
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: getPerformanceColor(performance.accuracy)
                }}>
                  {performance.accuracy}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Accuracy</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: getPerformanceColor(performance.f1Score)
                }}>
                  {performance.f1Score}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>F1 Score</div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Precision:</span>
              <span style={{ fontWeight: 'bold', color: getPerformanceColor(performance.precision) }}>
                {performance.precision}%
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Recall:</span>
              <span style={{ fontWeight: 'bold', color: getPerformanceColor(performance.recall) }}>
                {performance.recall}%
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Samples:</span>
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                {performance.totalSamples.toLocaleString()}
              </span>
            </div>
            
            <div style={{
              background: '#e8f5e8',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '4px solid #4CAF50'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#2E7D32' }}>
                +{performance.improvement}% improvement
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Last updated: {performance.lastUpdated.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Training Controls */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🚀 Model Training
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
              Select Model:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="equipment_recognition">Equipment Recognition</option>
              <option value="damage_detection">Damage Detection</option>
              <option value="maintenance_prediction">Maintenance Prediction</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
              Training Data:
            </label>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
              {trainingData.filter(t => t.trainingStatus === 'pending').length} pending samples
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
              User Feedback:
            </label>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
              {userFeedback.filter(f => !f.processed).length} unprocessed
            </div>
          </div>
        </div>
        
        {isTraining && (
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>Training Progress:</span>
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>{trainingProgress}%</span>
            </div>
            
            <div style={{
              width: '100%',
              height: '20px',
              background: '#e9ecef',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${trainingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #007bff, #0056b3)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={startModelTraining}
            disabled={isTraining}
            style={{
              background: isTraining ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isTraining ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isTraining ? 'Training...' : 'Start Training'}
          </button>
          
          <button style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Export Training Data
          </button>
          
          <button style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            View Training History
          </button>
        </div>
      </div>

      {/* Training Data Management */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          📊 Training Data Management
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {trainingData.map(item => (
            <div key={item.id} style={{
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
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center'
                }}>
                  <img
                    src={item.photoUrl}
                    alt="Training sample"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      Photo ID: {item.photoId}
                    </h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      Added: {item.addedDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    background: getTrainingStatusColor(item.trainingStatus),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.trainingStatus.toUpperCase()}
                  </span>
                  
                  <span style={{
                    background: item.isCorrect ? '#4CAF50' : '#F44336',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '50%',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>Prediction:</strong>
                  <div style={{ color: '#666' }}>{item.originalPrediction}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Actual:</strong>
                  <div style={{ color: '#666' }}>{item.actualResult}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Confidence:</strong>
                  <div style={{ color: '#666' }}>{(item.confidence * 100).toFixed(1)}%</div>
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
                  Use for Training
                </button>
                
                <button style={{
                  background: '#F44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Reject
                </button>
                
                <button style={{
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Feedback */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          💬 User Feedback
        </h2>
        
        {/* Feedback Form */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Submit Feedback</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Photo ID:
              </label>
              <input
                type="text"
                value={feedbackForm.photoId}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, photoId: e.target.value }))}
                placeholder="Enter photo ID"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Rating (1-5):
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={feedbackForm.confidence}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold', color: '#333' }}>
                {feedbackForm.confidence}/5
              </div>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Feedback:
            </label>
            <textarea
              value={feedbackForm.feedback}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Enter your feedback..."
              rows="3"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button
            onClick={submitFeedback}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}
          >
            Submit Feedback
          </button>
        </div>
        
        {/* Feedback List */}
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {userFeedback.map(feedback => (
            <div key={feedback.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '15px',
              background: feedback.processed ? '#f8f9fa' : '#fff3cd'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>Photo ID: {feedback.photoId}</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {feedback.timestamp.toLocaleString()}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '2px'
                  }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{
                        color: star <= feedback.userRating ? '#FFD700' : '#ddd',
                        fontSize: '1.2rem'
                      }}>
                        ★
                      </span>
                    ))}
                  </div>
                  
                  <span style={{
                    background: feedback.processed ? '#4CAF50' : '#FF9800',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {feedback.processed ? 'PROCESSED' : 'PENDING'}
                  </span>
                </div>
              </div>
              
              <div style={{ color: '#333', marginBottom: '10px' }}>
                {feedback.feedback}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button style={{
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  View Photo
                </button>
                
                {!feedback.processed && (
                  <button style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    Mark Processed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AITraining 