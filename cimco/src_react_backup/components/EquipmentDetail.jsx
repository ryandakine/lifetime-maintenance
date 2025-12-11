import React, { useState } from 'react'
import { format } from 'date-fns'
import { useMaintenanceLogs } from '../hooks/useMaintenanceLogs'
import {
  EQUIPMENT_ICONS,
  STATUS_COLORS,
  WORK_TYPE_ICONS
} from '../utils/constants'
import LoadingSpinner from './common/LoadingSpinner'
import ExportButton from './ExportButton'
import { useFavorites } from '../hooks/useFavorites'
import { exportMaintenanceLogsToPDF, exportToCSV } from '../utils/exportUtils'
import { useToast } from '../context/ToastContext'

import UsageAnalytics from './UsageAnalytics'

export default function EquipmentDetail({ equipment, onLogMaintenance }) {
  const { logs: maintenanceLogs, loading, error, totalCost } = useMaintenanceLogs(equipment.equipment_id)
  const [selectedLog, setSelectedLog] = useState(null)
  const [activeTab, setActiveTab] = useState('specs') // specs, history, analytics
  const { isFavorite, toggleFavorite } = useFavorites()
  const { success } = useToast()

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#2196F3'
  }

  const getWorkTypeIcon = (type) => {
    return WORK_TYPE_ICONS[type] || '⚙️'
  }

  const getEquipmentIcon = (type) => {
    return EQUIPMENT_ICONS[type] || '⚙️'
  }

  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toFixed(2)}` : 'N/A'
  }

  if (error) {
    return (
      <div className="error-container" style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#e74c3c'
      }}>
        <h3>⚠️ Error Loading Equipment</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="equipment-detail">
      {/* Equipment Header Card */}
      <div className="equipment-header">
        <div className="equipment-icon">
          {getEquipmentIcon(equipment.equipment_type)}
        </div>
        <h2>{equipment.equipment_name}</h2>
        <div className="qr-badge">{equipment.qr_code_id}</div>
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(equipment.status) }}
        >
          {equipment.status.toUpperCase()}
        </div>
        <div
          className="status-badge ai-badge"
          style={{
            backgroundColor: (() => {
              // Logic: >80% Green, 50-80% Yellow, <50% Red
              const health = 92; // This would be dynamic in real app
              if (health >= 80) return '#8cc63f'; // Cimco Green
              if (health >= 50) return '#f59e0b'; // Warning Yellow
              return '#ef4444'; // Danger Red
            })(),
            marginLeft: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#fff' // Ensure text is readable
          }}
        >
          <span>🤖</span>
          <span>Health: 92% (AI)</span>
        </div>
        <button
          onClick={() => {
            toggleFavorite(equipment.equipment_id)
            success(isFavorite(equipment.equipment_id) ? 'Removed from favorites' : 'Added to favorites!')
          }}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginLeft: '8px'
          }}
        >
          {isFavorite(equipment.equipment_id) ? '⭐' : '☆'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="detail-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('specs')}
          style={{
            background: activeTab === 'specs' ? '#2c3e50' : 'transparent',
            color: activeTab === 'specs' ? 'white' : '#2c3e50',
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'specs' ? 'none' : '1px solid #2c3e50',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📋 Info & Specs
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: activeTab === 'history' ? '#2c3e50' : 'transparent',
            color: activeTab === 'history' ? 'white' : '#2c3e50',
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'history' ? 'none' : '1px solid #2c3e50',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔧 Maintenance History
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            background: activeTab === 'analytics' ? '#2c3e50' : 'transparent',
            color: activeTab === 'analytics' ? 'white' : '#2c3e50',
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'analytics' ? 'none' : '1px solid #2c3e50',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📊 Analytics & Scale
        </button>
      </div>

      {/* TAB CONTENT: SPECS */}
      {activeTab === 'specs' && (
        <>
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

          <div className="info-card" style={{ marginTop: '16px', borderLeft: '4px solid #9b59b6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#8e44ad' }}>📡 Live Mesh Telemetry</h3>
              <span style={{ fontSize: '12px', background: '#e8daef', color: '#8e44ad', padding: '2px 8px', borderRadius: '10px' }}>
                BETA
              </span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Network Status:</span>
                <span className="info-value" style={{ color: '#27ae60', fontWeight: 'bold' }}>● Online (Mesh)</span>
              </div>
              <div className="info-item">
                <span className="info-label">Signal Strength:</span>
                <span className="info-value">92% (-85 dBm)</span>
              </div>
              <div className="info-item">
                <span className="info-label">Connected Node:</span>
                <span className="info-value">Node-Alpha-7</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Ping:</span>
                <span className="info-value">Just now</span>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              * Data transmitted via decentralized 915MHz LoRa mesh network
            </div>
          </div>
        </>
      )}

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && (
        <UsageAnalytics usageData={[
          // Mock data for analytics view
          {
            total_hours: 142.5,
            loaded_hours: 98.2,
            travel_hours: 32.1,
            idle_hours: 12.2,
            hydraulic_cycles: 1450,
            total_loads_moved: 320,
            paved_surface_hours: 40.0,
            gravel_surface_hours: 80.5,
            dirt_surface_hours: 22.0,
            hydraulic_wear_score: 35,
            tire_wear_score: 62,
            engine_wear_score: 28,
            avg_load_weight_lbs: 4200,
            max_hydraulic_pressure_psi: 2850,
            avg_hydraulic_temp_f: 165
          }
        ]} />
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'history' && (
        <>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-number">{maintenanceLogs.length}</div>
              <div className="stat-text">Total Logs</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{formatCurrency(totalCost)}</div>
              <div className="stat-text">Total Cost</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-button log-button" onClick={onLogMaintenance} style={{ flex: 2 }}>
              <span className="button-icon">📝</span>
              Log New Maintenance
            </button>
            <button
              className="secondary-button"
              onClick={() => window.print()}
              style={{ flex: 1, background: '#34495e', color: 'white', border: 'none' }}
            >
              <span className="button-icon">🖨️</span>
              Print QR
            </button>
          </div>

          {maintenanceLogs.length > 0 && (
            <ExportButton
              equipment={equipment}
              logs={maintenanceLogs}
              onExport={(format) => {
                if (format === 'pdf') {
                  exportMaintenanceLogsToPDF(equipment, maintenanceLogs)
                  success('PDF exported successfully!')
                } else if (format === 'csv') {
                  exportToCSV(equipment, maintenanceLogs)
                  success('CSV exported successfully!')
                }
              }}
            />
          )}

          <div className="maintenance-history">
            <h3>Maintenance History</h3>
            {loading ? (
              <LoadingSpinner size="medium" message="Loading maintenance logs..." />
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
        </>
      )}
    </div>
  )
}
