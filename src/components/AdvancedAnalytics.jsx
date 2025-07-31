import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    predictiveMaintenance: [],
    performanceMetrics: {},
    businessIntelligence: {},
    equipmentHealth: {},
    costAnalysis: {},
    trends: {}
  })
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedEquipment, setSelectedEquipment] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const tasks = useSelector(state => state.tasks?.tasks || [])
  const photos = useSelector(state => state.photos?.photos || [])

  useEffect(() => {
    loadAdvancedAnalytics()
  }, [selectedTimeframe, selectedEquipment])

  const loadAdvancedAnalytics = async () => {
    setIsLoading(true)
    
    // Simulate API call for advanced analytics
    setTimeout(() => {
      const mockData = generateAdvancedAnalyticsData()
      setAnalyticsData(mockData)
      setIsLoading(false)
    }, 1000)
  }

  const generateAdvancedAnalyticsData = () => {
    const now = new Date()
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return {
      predictiveMaintenance: [
        {
          equipmentId: 'treadmill_001',
          equipmentName: 'Treadmill T1',
          riskLevel: 'high',
          predictedFailure: daysAgo(-7),
          confidence: 0.89,
          recommendedAction: 'Replace belt and lubricate motor',
          estimatedCost: 450,
          priority: 'critical'
        },
        {
          equipmentId: 'elliptical_003',
          equipmentName: 'Elliptical E3',
          riskLevel: 'medium',
          predictedFailure: daysAgo(-14),
          confidence: 0.72,
          recommendedAction: 'Inspect bearings and tighten bolts',
          estimatedCost: 120,
          priority: 'high'
        },
        {
          equipmentId: 'weight_machine_007',
          equipmentName: 'Weight Machine W7',
          riskLevel: 'low',
          predictedFailure: daysAgo(-30),
          confidence: 0.45,
          recommendedAction: 'Routine inspection and cleaning',
          estimatedCost: 50,
          priority: 'medium'
        }
      ],
      performanceMetrics: {
        uptime: 94.7,
        responseTime: 2.3,
        taskCompletionRate: 87.3,
        customerSatisfaction: 4.6,
        efficiencyScore: 89.2,
        costPerMaintenance: 156.80
      },
      businessIntelligence: {
        totalEquipment: 47,
        activeMaintenance: 12,
        completedThisMonth: 89,
        totalCostThisMonth: 12450,
        costSavings: 3200,
        roi: 34.2
      },
      equipmentHealth: {
        excellent: 23,
        good: 15,
        fair: 7,
        poor: 2,
        critical: 1
      },
      costAnalysis: {
        preventive: 8500,
        corrective: 3200,
        emergency: 750,
        total: 12450
      },
      trends: {
        monthlyCosts: [9800, 11200, 12450, 11800, 13200, 14100],
        equipmentFailures: [3, 5, 2, 7, 4, 1],
        maintenanceEfficiency: [82, 85, 87, 89, 91, 89],
        customerSatisfaction: [4.2, 4.3, 4.4, 4.5, 4.6, 4.6]
      }
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#d32f2f'
      case 'high': return '#f57c00'
      case 'medium': return '#ff9800'
      case 'low': return '#4caf50'
      default: return '#757575'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#d32f2f'
      case 'high': return '#f57c00'
      case 'medium': return '#ff9800'
      case 'low': return '#4caf50'
      default: return '#757575'
    }
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
        Loading advanced analytics...
      </div>
    )
  }

  return (
    <div className="advanced-analytics" style={{
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
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊 Advanced Analytics Dashboard</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Predictive maintenance, performance metrics, and business intelligence
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        alignItems: 'center'
      }}>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>

        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="all">All Equipment</option>
          <option value="treadmills">Treadmills</option>
          <option value="ellipticals">Ellipticals</option>
          <option value="weight_machines">Weight Machines</option>
        </select>
      </div>

      {/* Key Performance Indicators */}
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
            {analyticsData.performanceMetrics.uptime}%
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Equipment Uptime
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            +2.3% from last month
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
            {analyticsData.performanceMetrics.taskCompletionRate}%
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Task Completion Rate
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            +5.1% from last month
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
            ${analyticsData.businessIntelligence.costSavings.toLocaleString()}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Cost Savings
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            This month
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
            {analyticsData.performanceMetrics.efficiencyScore}%
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            Efficiency Score
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            +3.2% from last month
          </div>
        </div>
      </div>

      {/* Predictive Maintenance */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          🔮 Predictive Maintenance Alerts
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {analyticsData.predictiveMaintenance.map((item, index) => (
            <div key={index} style={{
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
                    {item.equipmentName}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Predicted failure: {item.predictedFailure.toLocaleDateString()}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <span style={{
                    background: getRiskLevelColor(item.riskLevel),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.riskLevel.toUpperCase()} RISK
                  </span>
                  
                  <span style={{
                    background: getPriorityColor(item.priority),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.priority.toUpperCase()}
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
                  <strong style={{ color: '#333' }}>Confidence:</strong>
                  <div style={{ color: '#666' }}>{(item.confidence * 100).toFixed(1)}%</div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Recommended Action:</strong>
                  <div style={{ color: '#666' }}>{item.recommendedAction}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#333' }}>Estimated Cost:</strong>
                  <div style={{ color: '#666' }}>${item.estimatedCost}</div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px'
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
                  Schedule Maintenance
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
                
                <button style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Dismiss Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Health & Cost Analysis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Equipment Health */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
            🏥 Equipment Health Status
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {Object.entries(analyticsData.equipmentHealth).map(([status, count]) => (
              <div key={status} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: status === 'excellent' ? '#4CAF50' :
                               status === 'good' ? '#8BC34A' :
                               status === 'fair' ? '#FF9800' :
                               status === 'poor' ? '#F57C00' : '#D32F2F'
                  }} />
                  <span style={{
                    textTransform: 'capitalize',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {status}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                    {count}
                  </span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    equipment
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Analysis */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
            💰 Cost Analysis
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {Object.entries(analyticsData.costAnalysis).map(([type, amount]) => (
              <div key={type} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{
                  textTransform: 'capitalize',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  {type} Maintenance
                </span>
                
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: type === 'total' ? '#D32F2F' : '#333'
                }}>
                  ${amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#e8f5e8',
            borderRadius: '8px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <div style={{ fontWeight: 'bold', color: '#2E7D32' }}>
              💡 Cost Savings Opportunity
            </div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
              Increasing preventive maintenance by 20% could save ${(analyticsData.businessIntelligence.costSavings * 1.5).toLocaleString()} annually
            </div>
          </div>
        </div>
      </div>

      {/* Trends & Performance */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>
          📈 Performance Trends
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Monthly Costs Trend */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Monthly Maintenance Costs</h3>
            <div style={{
              display: 'flex',
              alignItems: 'end',
              gap: '8px',
              height: '150px'
            }}>
              {analyticsData.trends.monthlyCosts.map((cost, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(to top, #2196F3, #64B5F6)',
                  width: '40px',
                  height: `${(cost / 15000) * 100}%`,
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  ${(cost / 1000).toFixed(1)}k
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Failures Trend */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Equipment Failures</h3>
            <div style={{
              display: 'flex',
              alignItems: 'end',
              gap: '8px',
              height: '150px'
            }}>
              {analyticsData.trends.equipmentFailures.map((failures, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(to top, #F57C00, #FFB74D)',
                  width: '40px',
                  height: `${(failures / 10) * 100}%`,
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {failures}
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Trend */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Maintenance Efficiency</h3>
            <div style={{
              display: 'flex',
              alignItems: 'end',
              gap: '8px',
              height: '150px'
            }}>
              {analyticsData.trends.maintenanceEfficiency.map((efficiency, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(to top, #4CAF50, #81C784)',
                  width: '40px',
                  height: `${efficiency}%`,
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {efficiency}%
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalytics 