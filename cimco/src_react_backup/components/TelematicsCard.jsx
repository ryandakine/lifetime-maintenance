import React from 'react'
import { format } from 'date-fns'

export default function TelematicsCard({ telematicsData }) {
  if (!telematicsData || telematicsData.length === 0) {
    return (
      <div className="telematics-card">
        <p>No telematics data available for the last 30 days</p>
      </div>
    )
  }

  // Calculate totals
  const totals = telematicsData.reduce((acc, data) => ({
    totalMiles: acc.totalMiles + (data.total_miles || 0),
    highwayMiles: acc.highwayMiles + (data.highway_miles || 0),
    cityMiles: acc.cityMiles + (data.city_miles || 0),
    offroadMiles: acc.offroadMiles + (data.offroad_miles || 0),
    idleHours: acc.idleHours + (data.idle_hours || 0),
    drivingHours: acc.drivingHours + (data.driving_hours || 0),
    hardBraking: acc.hardBraking + (data.hard_braking_events || 0),
    rapidAccel: acc.rapidAccel + (data.rapid_acceleration_events || 0)
  }), {
    totalMiles: 0,
    highwayMiles: 0,
    cityMiles: 0,
    offroadMiles: 0,
    idleHours: 0,
    drivingHours: 0,
    hardBraking: 0,
    rapidAccel: 0
  })

  const highwayPercent = (totals.highwayMiles / totals.totalMiles * 100).toFixed(1)
  const cityPercent = (totals.cityMiles / totals.totalMiles * 100).toFixed(1)
  const offroadPercent = (totals.offroadMiles / totals.totalMiles * 100).toFixed(1)

  // Latest data for wear scores
  const latestData = telematicsData[0]
  const avgBrakeWear = (telematicsData.reduce((sum, d) => sum + (d.brake_wear_score || 0), 0) / telematicsData.length).toFixed(1)
  const avgTireWear = (telematicsData.reduce((sum, d) => sum + (d.tire_wear_score || 0), 0) / telematicsData.length).toFixed(1)
  const avgEngineWear = (telematicsData.reduce((sum, d) => sum + (d.engine_wear_score || 0), 0) / telematicsData.length).toFixed(1)

  return (
    <div className="telematics-card">
      <h3>📡 GPS Telematics Data (Last 30 Days)</h3>

      {/* Mileage Summary */}
      <div className="telematics-section">
        <h4>🗺️ Mileage Breakdown</h4>
        <div className="mileage-stats">
          <div className="stat-large">
            <div className="stat-large-value">{totals.totalMiles.toFixed(0)}</div>
            <div className="stat-large-label">Total Miles</div>
          </div>
        </div>

        <div className="mileage-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🛣️ Highway</span>
              <span>{highwayPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar highway"
                style={{ width: `${highwayPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.highwayMiles.toFixed(0)} mi</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🏙️ City</span>
              <span>{cityPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar city"
                style={{ width: `${cityPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.cityMiles.toFixed(0)} mi</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span>🏞️ Off-Road</span>
              <span>{offroadPercent}%</span>
            </div>
            <div className="breakdown-bar-container">
              <div
                className="breakdown-bar offroad"
                style={{ width: `${offroadPercent}%` }}
              />
            </div>
            <div className="breakdown-value">{totals.offroadMiles.toFixed(0)} mi</div>
          </div>
        </div>
      </div>

      {/* Driving Behavior */}
      <div className="telematics-section">
        <h4>🚗 Driving Behavior</h4>
        <div className="behavior-grid">
          <div className="behavior-stat">
            <div className="behavior-icon">⏱️</div>
            <div className="behavior-value">{totals.drivingHours.toFixed(1)} hrs</div>
            <div className="behavior-label">Driving Hours</div>
          </div>
          <div className="behavior-stat">
            <div className="behavior-icon">⏸️</div>
            <div className="behavior-value">{totals.idleHours.toFixed(1)} hrs</div>
            <div className="behavior-label">Idle Time</div>
          </div>
          <div className="behavior-stat warning">
            <div className="behavior-icon">🛑</div>
            <div className="behavior-value">{totals.hardBraking}</div>
            <div className="behavior-label">Hard Braking</div>
          </div>
          <div className="behavior-stat warning">
            <div className="behavior-icon">⚡</div>
            <div className="behavior-value">{totals.rapidAccel}</div>
            <div className="behavior-label">Rapid Accel</div>
          </div>
        </div>
      </div>

      {/* Wear Analysis */}
      <div className="telematics-section">
        <h4>🔧 Component Wear Analysis</h4>
        <div className="wear-analysis">
          <div className="wear-item">
            <div className="wear-header">
              <span className="wear-label">🛑 Brake System</span>
              <span className="wear-percentage">{avgBrakeWear}%</span>
            </div>
            <div className="wear-bar-container">
              <div
                className="wear-bar"
                style={{
                  width: `${avgBrakeWear}%`,
                  backgroundColor: avgBrakeWear > 70 ? '#f44336' : avgBrakeWear > 40 ? '#FF9800' : '#4CAF50'
                }}
              />
            </div>
            <div className="wear-status">
              {avgBrakeWear > 70 && '⚠️ High wear - inspection recommended'}
              {avgBrakeWear > 40 && avgBrakeWear <= 70 && '⚠️ Moderate wear - monitor closely'}
              {avgBrakeWear <= 40 && '✅ Normal wear'}
            </div>
          </div>

          <div className="wear-item">
            <div className="wear-header">
              <span className="wear-label">🚗 Tires</span>
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
              {avgTireWear > 70 && '⚠️ High wear - replacement soon'}
              {avgTireWear > 40 && avgTireWear <= 70 && '⚠️ Moderate wear'}
              {avgTireWear <= 40 && '✅ Good condition'}
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

      {/* Insight Box */}
      <div className="insight-box">
        <h4>💡 AI Insights</h4>
        {parseFloat(cityPercent) > 50 && (
          <p>⚠️ High city driving ({cityPercent}%) increases brake wear. Expect {(50000 * (cityPercent/100) * 0.6).toFixed(0)} miles until brake service vs typical 45,000 miles.</p>
        )}
        {totals.hardBraking > 100 && (
          <p>🚨 Excessive hard braking detected ({totals.hardBraking} events). Coach driver on smooth braking to extend brake life.</p>
        )}
        {parseFloat(highwayPercent) > 70 && (
          <p>✅ Excellent highway driving ({highwayPercent}%) - optimal for fuel economy and component longevity.</p>
        )}
      </div>

      {/* Historical Data Table */}
      <div className="telematics-section">
        <h4>📊 Weekly Breakdown</h4>
        <div className="telematics-table">
          {telematicsData.map((data, index) => (
            <div key={data.usage_id} className="table-row">
              <div className="table-cell">
                {format(new Date(data.period_start), 'MMM dd')} - {format(new Date(data.period_end), 'MMM dd')}
              </div>
              <div className="table-cell">{data.total_miles?.toFixed(0)} mi</div>
              <div className="table-cell">
                <span className="wear-badge brake">{data.brake_wear_score?.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
