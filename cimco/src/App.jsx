import React, { useState } from 'react'
import QRScanner from './components/QRScanner'
import EquipmentDetail from './components/EquipmentDetail'
import EquipmentList from './components/EquipmentList'
import MaintenanceLogForm from './components/MaintenanceLogForm'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showScanner, setShowScanner] = useState(false)

  const handleQRScan = (equipmentData) => {
    setSelectedEquipment(equipmentData)
    setShowScanner(false)
    setCurrentView('equipment-detail')
  }

  const handleSelectEquipment = (equipment) => {
    setSelectedEquipment(equipment)
    setCurrentView('equipment-detail')
  }

  const handleLogMaintenance = () => {
    setCurrentView('maintenance-log')
  }

  const handleMaintenanceSubmit = () => {
    setCurrentView('equipment-detail')
    // Refresh equipment data in EquipmentDetail component
  }

  const handleBack = () => {
    if (currentView === 'maintenance-log') {
      setCurrentView('equipment-detail')
    } else if (currentView === 'equipment-detail') {
      setCurrentView('home')
      setSelectedEquipment(null)
    } else {
      setCurrentView('home')
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          {currentView !== 'home' && (
            <button className="back-button" onClick={handleBack}>
              ← Back
            </button>
          )}
          <h1 className="app-title">
            <span className="logo">🏭</span>
            Cimco Equipment Tracker
          </h1>
          {currentView === 'home' && (
            <div className="header-badge">MVP Demo</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'home' && (
          <div className="home-view">
            <div className="welcome-card">
              <h2>Welcome to Cimco Resources</h2>
              <p>Track equipment maintenance and preserve knowledge</p>
            </div>

            <div className="action-buttons">
              <button
                className="primary-button scan-button"
                onClick={() => setShowScanner(true)}
              >
                <span className="button-icon">📱</span>
                Scan Equipment QR Code
              </button>

              <button
                className="secondary-button"
                onClick={() => setCurrentView('equipment-list')}
              >
                <span className="button-icon">📋</span>
                Browse All Equipment
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">5</div>
                <div className="stat-label">Equipment Tracked</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">14</div>
                <div className="stat-label">Maintenance Logs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">100%</div>
                <div className="stat-label">Knowledge Preserved</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'equipment-list' && (
          <EquipmentList onSelectEquipment={handleSelectEquipment} />
        )}

        {currentView === 'equipment-detail' && selectedEquipment && (
          <EquipmentDetail
            equipment={selectedEquipment}
            onLogMaintenance={handleLogMaintenance}
          />
        )}

        {currentView === 'maintenance-log' && selectedEquipment && (
          <MaintenanceLogForm
            equipment={selectedEquipment}
            onSubmit={handleMaintenanceSubmit}
            onCancel={handleBack}
          />
        )}
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="modal-overlay" onClick={() => setShowScanner(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowScanner(false)}
            >
              ✕
            </button>
            <QRScanner
              onScan={handleQRScan}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Cimco Resources - Sterling, Illinois</p>
        <p className="footer-subtitle">Built for Monday Demo</p>
      </footer>
    </div>
  )
}

export default App
