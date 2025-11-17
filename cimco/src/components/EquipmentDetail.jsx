import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function EquipmentDetail({ equipment, onLogMaintenance }) {
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    fetchMaintenanceLogs()
  }, [equipment])

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
    } finally {
      setLoading(false)
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
      emergency: '🚨'
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

  return (
    <div className="equipment-detail">
      {/* Equipment Header Card */}
      <div className="equipment-header">
        <div className="equipment-icon">
          {equipment.equipment_type === 'Shredder' && '🏭'}
          {equipment.equipment_type === 'Crane' && '🏗️'}
          {equipment.equipment_type === 'Conveyor' && '📦'}
          {equipment.equipment_type === 'Baler' && '🗜️'}
          {equipment.equipment_type === 'Forklift' && '🚜'}
          {!['Shredder', 'Crane', 'Conveyor', 'Baler', 'Forklift'].includes(equipment.equipment_type) && '⚙️'}
        </div>
        <h2>{equipment.equipment_name}</h2>
        <div className="qr-badge">{equipment.qr_code_id}</div>
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(equipment.status) }}
        >
          {equipment.status.toUpperCase()}
        </div>
      </div>

      {/* Equipment Info */}
      <div className="info-card">
        <h3>Equipment Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span className="info-value">{equipment.equipment_type || 'N/A'}</span>
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
          <div className="info-item">
            <span className="info-label">Year:</span>
            <span className="info-value">{equipment.year_manufactured || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-value">{equipment.location_zone || 'N/A'}</span>
          </div>
        </div>
        {equipment.notes && (
          <div className="info-notes">
            <p>{equipment.notes}</p>
          </div>
        )}
      </div>

      {/* Maintenance Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-number">{maintenanceLogs.length}</div>
          <div className="stat-text">Total Logs</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{formatCurrency(totalMaintenanceCost)}</div>
          <div className="stat-text">Total Cost</div>
        </div>
      </div>

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
            <p className="empty-subtitle">Click "Log New Maintenance" to add the first log</p>
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
  )
}
