import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import TelematicsCard from './TelematicsCard'
import PredictiveAlerts from './PredictiveAlerts'
import UsageAnalytics from './UsageAnalytics'

export default function EquipmentDetailEnhanced({ equipment, onLogMaintenance }) {
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [predictions, setPredictions] = useState([])
  const [telematicsData, setTelematicsData] = useState(null)
  const [usageData, setUsageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAllData()
  }, [equipment])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchMaintenanceLogs(),
      fetchPredictions(),
      fetchTelematicsData(),
      fetchUsageData()
    ])
    setLoading(false)
  }

  const fetchMaintenanceLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('equipment_id', equipment.equipment_id)
        .order('work_date', { ascending: false })

      if (error) throw error
      setMaintenanceLogs(data || [])
    } catch (err) {
      console.error('Error fetching maintenance logs:', err)
    }
  }

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_predictions')
        .select('*')
        .eq('equipment_id', equipment.equipment_id)
        .in('status', ['pending', 'scheduled'])
        .order('priority', { ascending: false })

      if (error) throw error
      setPredictions(data || [])
    } catch (err) {
      console.error('Error fetching predictions:', err)
    }
  }

  const fetchTelematicsData = async () => {
    if (equipment.equipment_category !== 'Vehicle') return

    try {
      const { data, error } = await supabase
        .from('vehicle_usage_data')
        .select('*')
        .eq('equipment_id', equipment.equipment_id)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('period_start', { ascending: false })

      if (error) throw error
      setTelematicsData(data || [])
    } catch (err) {
      console.error('Error fetching telematics:', err)
    }
  }

  const fetchUsageData = async () => {
    if (equipment.equipment_category !== 'Mobile') return

    try {
      const { data, error } = await supabase
        .from('mobile_equipment_usage')
        .select('*')
        .eq('equipment_id', equipment.equipment_id)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('period_start', { ascending: false })

      if (error) throw error
      setUsageData(data || [])
    } catch (err) {
      console.error('Error fetching usage data:', err)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      active: '#4CAF50',
      maintenance: '#FF9800',
      down: '#f44336',
      retired: '#9E9E9E'
    }
    return colors[status] || '#2196F3'
  }

  const getWorkTypeIcon = (type) => {
    const icons = {
      preventive: '🔧',
      repair: '🔨',
      inspection: '🔍',
      emergency: '🚨',
      predictive: '🤖'
    }
    return icons[type] || '⚙️'
  }

  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toFixed(2)}` : 'N/A'
  }

  const totalMaintenanceCost = maintenanceLogs.reduce(
    (sum, log) => sum + (parseFloat(log.cost) || 0),
    0
  )

  // Calculate total wear scores from telematics
  const avgBrakeWear = telematicsData?.length > 0
    ? (telematicsData.reduce((sum, d) => sum + (d.brake_wear_score || 0), 0) / telematicsData.length).toFixed(1)
    : null

  const avgTireWear = telematicsData?.length > 0
    ? (telematicsData.reduce((sum, d) => sum + (d.tire_wear_score || 0), 0) / telematicsData.length).toFixed(1)
    : null

  const totalMilesLast30Days = telematicsData?.reduce((sum, d) => sum + (d.total_miles || 0), 0) || 0

  return (
    <div className="equipment-detail-enhanced">
      {/* Equipment Header Card */}
      <div className="equipment-header">
        <div className="equipment-icon">
          {equipment.equipment_type === 'Semi' && '🚛'}
          {equipment.equipment_type === 'Loader' && '🏗️'}
          {equipment.equipment_type === 'Shredder Motor' && '⚡'}
          {equipment.equipment_type === 'Skid Steer' && '🚜'}
        </div>
        <h2>{equipment.equipment_name}</h2>
        <div className="qr-badge">{equipment.qr_code_id}</div>
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(equipment.status) }}
        >
          {equipment.status.toUpperCase()}
        </div>
        {equipment.telematics_enabled && (
          <div className="telematics-badge">📡 GPS ENABLED</div>
        )}
      </div>

      {/* Predictive Alerts */}
      {predictions.length > 0 && (
        <PredictiveAlerts predictions={predictions} />
      )}

      {/* Navigation Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        {equipment.equipment_category === 'Vehicle' && (
          <button
            className={`tab ${activeTab === 'telematics' ? 'active' : ''}`}
            onClick={() => setActiveTab('telematics')}
          >
            📍 GPS Data
          </button>
        )}
        {equipment.equipment_category === 'Mobile' && (
          <button
            className={`tab ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            ⚙️ Usage
          </button>
        )}
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📝 History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* Equipment Info */}
          <div className="info-card">
            <h3>Equipment Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{equipment.equipment_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Category:</span>
                <span className="info-value">{equipment.equipment_category}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Manufacturer:</span>
                <span className="info-value">{equipment.manufacturer || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Model:</span>
                <span className="info-value">{equipment.model_number || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Serial:</span>
                <span className="info-value">{equipment.serial_number || 'N/A'}</span>
              </div>
              {equipment.vin_number && (
                <div className="info-item">
                  <span className="info-label">VIN:</span>
                  <span className="info-value">{equipment.vin_number}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Year:</span>
                <span className="info-value">{equipment.year_manufactured || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{equipment.location_zone || 'N/A'}</span>
              </div>
              {equipment.current_hours && (
                <div className="info-item">
                  <span className="info-label">Operating Hours:</span>
                  <span className="info-value">{equipment.current_hours.toLocaleString()} hrs</span>
                </div>
              )}
              {equipment.current_miles && (
                <div className="info-item">
                  <span className="info-label">Odometer:</span>
                  <span className="info-value">{equipment.current_miles.toLocaleString()} mi</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-grid-enhanced">
            <div className="stat-box">
              <div className="stat-number">{maintenanceLogs.length}</div>
              <div className="stat-text">Total Logs</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{formatCurrency(totalMaintenanceCost)}</div>
              <div className="stat-text">Total Cost</div>
            </div>
            {predictions.length > 0 && (
              <div className="stat-box alert-box">
                <div className="stat-number">{predictions.length}</div>
                <div className="stat-text">Active Alerts</div>
              </div>
            )}
            {totalMilesLast30Days > 0 && (
              <div className="stat-box">
                <div className="stat-number">{totalMilesLast30Days.toFixed(0)}</div>
                <div className="stat-text">Miles (30d)</div>
              </div>
            )}
          </div>

          {/* Wear Indicators for Vehicles */}
          {equipment.equipment_category === 'Vehicle' && avgBrakeWear && (
            <div className="wear-indicators">
              <h3>Wear Analysis (30-Day Average)</h3>
              <div className="wear-grid">
                <div className="wear-item">
                  <div className="wear-label">🛑 Brake Wear</div>
                  <div className="wear-bar-container">
                    <div
                      className="wear-bar"
                      style={{
                        width: `${avgBrakeWear}%`,
                        backgroundColor: avgBrakeWear > 70 ? '#f44336' : avgBrakeWear > 40 ? '#FF9800' : '#4CAF50'
                      }}
                    />
                  </div>
                  <div className="wear-value">{avgBrakeWear}%</div>
                </div>
                <div className="wear-item">
                  <div className="wear-label">🔧 Tire Wear</div>
                  <div className="wear-bar-container">
                    <div
                      className="wear-bar"
                      style={{
                        width: `${avgTireWear}%`,
                        backgroundColor: avgTireWear > 70 ? '#f44336' : avgTireWear > 40 ? '#FF9800' : '#4CAF50'
                      }}
                    />
                  </div>
                  <div className="wear-value">{avgTireWear}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'telematics' && equipment.equipment_category === 'Vehicle' && (
        <TelematicsCard telematicsData={telematicsData} />
      )}

      {activeTab === 'usage' && equipment.equipment_category === 'Mobile' && (
        <UsageAnalytics usageData={usageData} />
      )}

      {activeTab === 'history' && (
        <div className="history-tab">
          {/* Log Maintenance Button */}
          <button className="primary-button log-button" onClick={onLogMaintenance}>
            <span className="button-icon">📝</span>
            Log New Maintenance
          </button>

          {/* Maintenance History */}
          <div className="maintenance-history">
            <h3>Maintenance History</h3>
            {loading ? (
              <div className="loading">Loading maintenance logs...</div>
            ) : maintenanceLogs.length === 0 ? (
              <div className="empty-state">
                <p>No maintenance logs yet</p>
              </div>
            ) : (
              <div className="logs-list">
                {maintenanceLogs.map((log) => (
                  <div
                    key={log.log_id}
                    className="log-card"
                    onClick={() => setSelectedLog(selectedLog === log.log_id ? null : log.log_id)}
                  >
                    <div className="log-header">
                      <div className="log-type">
                        <span className="log-icon">{getWorkTypeIcon(log.work_type)}</span>
                        <span className="log-type-text">{log.work_type}</span>
                        {log.was_predicted && <span className="predicted-badge">🤖 AI Predicted</span>}
                      </div>
                      <div className="log-date">
                        {format(new Date(log.work_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="log-description">{log.work_description}</div>
                    <div className="log-meta">
                      <span className="log-worker">👷 {log.worker_name}</span>
                      {log.cost && (
                        <span className="log-cost">💰 {formatCurrency(log.cost)}</span>
                      )}
                    </div>
                    {log.equipment_miles_at_service && (
                      <div className="log-miles">
                        📍 {log.equipment_miles_at_service.toLocaleString()} miles
                      </div>
                    )}
                    {log.equipment_hours_at_service && (
                      <div className="log-hours">
                        ⏱️ {log.equipment_hours_at_service.toLocaleString()} hours
                      </div>
                    )}

                    {selectedLog === log.log_id && (
                      <div className="log-details">
                        {log.parts_used && (
                          <div className="detail-item">
                            <strong>Parts Used:</strong>
                            <p>{log.parts_used}</p>
                          </div>
                        )}
                        {log.hours_spent && (
                          <div className="detail-item">
                            <strong>Hours Spent:</strong>
                            <p>{log.hours_spent} hours</p>
                          </div>
                        )}
                        {log.photo_urls && log.photo_urls.length > 0 && (
                          <div className="detail-item">
                            <strong>Photos:</strong>
                            <div className="photo-grid">
                              {log.photo_urls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Maintenance photo ${index + 1}`}
                                  className="log-photo"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
