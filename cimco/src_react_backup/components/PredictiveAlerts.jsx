import React from 'react'
import { format } from 'date-fns'

export default function PredictiveAlerts({ predictions }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#f44336',
      critical: '#d32f2f'
    }
    return colors[priority] || '#2196F3'
  }

  const getPriorityIcon = (priority) => {
    const icons = {
      low: '✅',
      medium: '⚠️',
      high: '🚨',
      critical: '❗'
    }
    return icons[priority] || 'ℹ️'
  }

  return (
    <div className="predictive-alerts">
      <h3>🤖 Predictive Maintenance Alerts</h3>
      <div className="alerts-list">
        {predictions.map((prediction) => (
          <div
            key={prediction.prediction_id}
            className="alert-card"
            style={{ borderLeftColor: getPriorityColor(prediction.priority) }}
          >
            <div className="alert-header">
              <span className="alert-icon">
                {getPriorityIcon(prediction.priority)}
              </span>
              <div className="alert-content">
                <div className="alert-title">{prediction.predicted_item}</div>
                <div className="alert-type">{prediction.prediction_type.replace('_', ' ')}</div>
              </div>
              <div
                className="alert-priority-badge"
                style={{ backgroundColor: getPriorityColor(prediction.priority) }}
              >
                {prediction.priority}
              </div>
            </div>

            {prediction.predicted_date && (
              <div className="alert-date">
                📅 Predicted due: {format(new Date(prediction.predicted_date), 'MMM dd, yyyy')}
              </div>
            )}

            {prediction.predicted_at_miles && (
              <div className="alert-miles">
                📍 At approximately: {prediction.predicted_at_miles.toLocaleString()} miles
              </div>
            )}

            {prediction.notes && (
              <div className="alert-notes">{prediction.notes}</div>
            )}

            {prediction.confidence_score && (
              <div className="alert-confidence">
                <div className="confidence-label">AI Confidence:</div>
                <div className="confidence-bar-container">
                  <div
                    className="confidence-bar"
                    style={{
                      width: `${prediction.confidence_score}%`,
                      backgroundColor: prediction.confidence_score > 80 ? '#4CAF50' : prediction.confidence_score > 60 ? '#FF9800' : '#f44336'
                    }}
                  />
                </div>
                <div className="confidence-value">{prediction.confidence_score.toFixed(1)}%</div>
              </div>
            )}

            <div className="alert-factors">
              <div className="factor-item">
                <span>Wear:</span>
                <span>{prediction.wear_score?.toFixed(1)}%</span>
              </div>
              <div className="factor-item">
                <span>Usage Pattern:</span>
                <span>{prediction.usage_pattern_factor?.toFixed(1)}%</span>
              </div>
              <div className="factor-item">
                <span>Historical Data:</span>
                <span>{prediction.historical_data_factor?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
