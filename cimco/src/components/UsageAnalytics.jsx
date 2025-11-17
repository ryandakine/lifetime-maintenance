import React from 'react'
import { format } from 'date-fns'

export default function UsageAnalytics({ usageData }) {
  if (!usageData || usageData.length === 0) {
    return (
      <div className="usage-analytics">
        <p>No usage data available for the last 30 days</p>
      </div>
    )
  }

  // Calculate totals
  const totals = usageData.reduce((acc, data) => ({
    totalHours: acc.totalHours + (data.total_hours || 0),
    loadedHours: acc.loadedHours + (data.loaded_hours || 0),
    travelHours: acc.travelHours + (data.travel_hours || 0),
    idleHours: acc.idleHours + (data.idle_hours || 0),
    hydraulicCycles: acc.hydraulicCycles + (data.hydraulic_cycles || 0),
    totalLoads: acc.totalLoads + (data.total_loads_moved || 0),
    pavedHours: acc.pavedHours + (data.paved_surface_hours || 0),
    gravelHours: acc.gravelHours + (data.gravel_surface_hours || 0),
    dirtHours: acc.dirtHours + (data.dirt_surface_hours || 0)
  }), {
    totalHours: 0,
    loadedHours: 0,
    travelHours: 0,
    idleHours: 0,
    hydraulicCycles: 0,
    totalLoads: 0,
    pavedHours: 0,
    gravelHours: 0,
    dirtHours: 0
  })

  const loadedPercent = (totals.loadedHours / totals.totalHours * 100).toFixed(1)
  const travelPercent = (totals.travelHours / totals.totalHours * 100).toFixed(1)
  const idlePercent = (totals.idleHours / totals.totalHours * 100).toFixed(1)

  const pavedPercent = (totals.pavedHours / totals.totalHours * 100).toFixed(1)
  const gravelPercent = (totals.gravelHours / totals.totalHours * 100).toFixed(1)
  const dirtPercent = (totals.dirtHours / totals.totalHours * 100).toFixed(1)

  // Latest data for wear scores
  const latestData = usageData[0]
  const avgHydraulicWear = (usageData.reduce((sum, d) => sum + (d.hydraulic_wear_score || 0), 0) / usageData.length).toFixed(1)
  const avgTireWear = (usageData.reduce((sum, d) => sum + (d.tire_wear_score || 0), 0) / usageData.length).toFixed(1)
  const avgEngineWear = (usageData.reduce((sum, d) => sum + (d.engine_wear_score || 0), 0) / usageData.length).toFixed(1)

  return (
    <div className="usage-analytics">
      <h3>⚙️ Equipment Usage Analytics (Last 30 Days)</h3>

      {/* Operating Hours Summary */}
      <div className="usage-section">
        <h4>⏱️ Operating Hours Breakdown</h4>
        <div className="hours-stats">
          <div className="stat-large">
            <div className="stat-large-value">{totals.totalHours.toFixed(1)}</div>
            <div className="stat-large-label">Total Hours</div>
          </div>
        </div>

        <div className="hours-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🏗️ Under Load</span>
              <span>{loadedPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar loaded"
                style={{ width: `${loadedPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.loadedHours.toFixed(1)} hrs</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🚜 Travel</span>
              <span>{travelPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar travel"
                style={{ width: `${travelPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.travelHours.toFixed(1)} hrs</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>⏸️ Idle</span>
              <span>{idlePercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar idle"
                style={{ width: `${idlePercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.idleHours.toFixed(1)} hrs</div>
          </div>
        </div>
      </div>

      {/* Terrain Analysis */}
      <div className="usage-section">
        <h4>🏞️ Terrain Analysis</h4>
        <div className="terrain-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🛣️ Paved</span>
              <span>{pavedPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar paved"
                style={{ width: `${pavedPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.pavedHours.toFixed(1)} hrs</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🪨 Gravel</span>
              <span>{gravelPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar gravel"
                style={{ width: `${gravelPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.gravelHours.toFixed(1)} hrs</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🌾 Dirt/Rough</span>
              <span>{dirtPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar dirt"
                style={{ width: `${dirtPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.dirtHours.toFixed(1)} hrs</div>
          </div>
        </div>
      </div>

      {/* Productivity Stats */}
      <div className="usage-section">
        <h4>📊 Productivity Metrics</h4>
        <div className="productivity-grid">
          <div className="productivity-stat">
            <div className="productivity-icon">🔄</div>
            <div className="productivity-value">{totals.hydraulicCycles.toLocaleString()}</div>
            <div className="productivity-label">Hydraulic Cycles</div>
          </div>
          <div className="productivity-stat">
            <div className="productivity-icon">📦</div>
            <div className="productivity-value">{totals.totalLoads.toLocaleString()}</div>
            <div className="productivity-label">Loads Moved</div>
          </div>
          <div className="productivity-stat">
            <div className="productivity-icon">⚡</div>
            <div className="productivity-value">{(totals.totalLoads / totals.totalHours).toFixed(1)}</div>
            <div className="productivity-label">Loads/Hour</div>
          </div>
          <div className="productivity-stat">
            <div className="productivity-icon">💪</div>
            <div className="productivity-value">{latestData.avg_load_weight_lbs?.toLocaleString()}</div>
            <div className="productivity-label">Avg Load (lbs)</div>
          </div>
        </div>
      </div>

      {/* Hydraulic System Health */}
      {latestData.max_hydraulic_pressure_psi && (
        <div className="usage-section">
          <h4>🔧 Hydraulic System Health</h4>
          <div className="hydraulic-grid">
            <div className="hydraulic-stat">
              <div className="hydraulic-label">Max Pressure</div>
              <div className="hydraulic-value">{latestData.max_hydraulic_pressure_psi.toLocaleString()} PSI</div>
              <div className="hydraulic-status">
                {latestData.max_hydraulic_pressure_psi > 3000 ? '⚠️ High' : '✅ Normal'}
              </div>
            </div>
            <div className="hydraulic-stat">
              <div className="hydraulic-label">Avg Temperature</div>
              <div className="hydraulic-value">{latestData.avg_hydraulic_temp_f?.toFixed(1)}°F</div>
              <div className="hydraulic-status">
                {latestData.avg_hydraulic_temp_f > 180 ? '⚠️ Warm' : '✅ Normal'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Component Wear Analysis */}
      <div className="usage-section">
        <h4>🔧 Component Wear Analysis</h4>
        <div className="wear-analysis">
          <div className="wear-item">
            <div className="wear-header">
              <span className="wear-label">🚰 Hydraulic System</span>
              <span className="wear-percentage">{avgHydraulicWear}%</span>
            </div>
            <div className="wear-bar-container">
              <div
                className="wear-bar"
                style={{
                  width: `${avgHydraulicWear}%`,
                  backgroundColor: avgHydraulicWear > 70 ? '#f44336' : avgHydraulicWear > 40 ? '#FF9800' : '#4CAF50'
                }}
              />
            </div>
            <div className="wear-status">
              {avgHydraulicWear > 70 && '⚠️ Service recommended'}
              {avgHydraulicWear > 40 && avgHydraulicWear <= 70 && '⚠️ Monitor closely'}
              {avgHydraulicWear <= 40 && '✅ Good condition'}
            </div>
          </div>

          <div className="wear-item">
            <div className="wear-header">
              <span className="wear-label">🚗 Tires/Tracks</span>
              <span className="wear-percentage">{avgTireWear}%</span>
            </div>
            <div className="wear-bar-container">
              <div
                className="wear-bar"
                style={{
                  width: `${avgTireWear}%`,
                  backgroundColor: avgTireWear > 70 ? '#f44336' : avgTireWear > 40 ? '#FF9800' : '#4CAF50'
                }}
              />
            </div>
            <div className="wear-status">
              {avgTireWear > 70 && '⚠️ Replacement soon'}
              {avgTireWear > 40 && avgTireWear <= 70 && '⚠️ Moderate wear'}
              {avgTireWear <= 40 && '✅ Good tread'}
            </div>
          </div>

          <div className="wear-item">
            <div className="wear-header">
              <span className="wear-label">🔧 Engine</span>
              <span className="wear-percentage">{avgEngineWear}%</span>
            </div>
            <div className="wear-bar-container">
              <div
                className="wear-bar"
                style={{
                  width: `${avgEngineWear}%`,
                  backgroundColor: avgEngineWear > 70 ? '#f44336' : avgEngineWear > 40 ? '#FF9800' : '#4CAF50'
                }}
              />
            </div>
            <div className="wear-status">
              {avgEngineWear > 70 && '⚠️ Service required'}
              {avgEngineWear > 40 && avgEngineWear <= 70 && '⚠️ Schedule service'}
              {avgEngineWear <= 40 && '✅ Running well'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="insight-box">
        <h4>💡 AI Insights</h4>
        {parseFloat(dirtPercent) > 60 && (
          <p>⚠️ High rough terrain usage ({dirtPercent}%) - expect accelerated tire and suspension wear. Consider more frequent inspections.</p>
        )}
        {parseFloat(idlePercent) > 15 && (
          <p>💡 High idle time ({idlePercent}%) - reducing idle can save fuel and extend engine life.</p>
        )}
        {parseFloat(loadedPercent) > 80 && (
          <p>✅ Excellent productivity - equipment is being used efficiently ({loadedPercent}% under load).</p>
        )}
      </div>
    </div>
  )
}
