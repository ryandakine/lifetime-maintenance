import React, { useState } from 'react'
import QRScanner from './components/QRScanner'
import EquipmentDetail from './components/EquipmentDetail'
import EquipmentList from './components/EquipmentList'
import MaintenanceLogForm from './components/MaintenanceLogForm'
import { useEquipmentStats } from './hooks/useEquipmentStats'
import Toast from './components/common/Toast'
import Breadcrumbs from './components/common/Breadcrumbs'
import FloatingActionButton from './components/common/FloatingActionButton'
import SplashScreen from './components/SplashScreen'
import UserProfile from './components/gamification/UserProfile'
import Leaderboard from './components/gamification/Leaderboard'
import LanguageSelector from './components/LanguageSelector'
import OperatorMode from './components/OperatorMode'
import AboutCimco from './components/AboutCimco'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { getBilingualText } from './utils/translations'
import { useWakeLock } from './hooks/useWakeLock'
import './App.css'
import './industrial-theme.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const { stats } = useEquipmentStats()
  const { language } = useLanguage()
  const wakeLock = useWakeLock()

  // Request wake lock on mount
  React.useEffect(() => {
    wakeLock.request()
    return () => wakeLock.release()
  }, [])

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

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', onClick: () => setCurrentView('home') }]

    if (currentView === 'equipment-list') {
      crumbs.push({ label: 'Equipment List' })
    } else if (currentView === 'equipment-detail' && selectedEquipment) {
      crumbs.push({ label: 'Equipment List', onClick: () => setCurrentView('equipment-list') })
      crumbs.push({ label: selectedEquipment.equipment_name })
    } else if (currentView === 'maintenance-log' && selectedEquipment) {
      crumbs.push({ label: 'Equipment List', onClick: () => setCurrentView('equipment-list') })
      crumbs.push({ label: selectedEquipment.equipment_name, onClick: () => setCurrentView('equipment-detail') })
      crumbs.push({ label: 'Log Maintenance' })
    }

    return crumbs
  }

  return (
    <div className="app">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Toast />
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          {currentView !== 'home' && (
            <button className="back-button" onClick={handleBack}>
              ← Back
            </button>
          )}
          <h1 className="app-title" onClick={() => setCurrentView('about')} style={{ cursor: 'pointer' }}>
            <img
              src="/cimco-logo-official.png"
              alt="Cimco Resources"
              className="header-logo"
            />
            Equipment Tracker
          </h1>
          {currentView === 'home' && (
            <div className="header-badge">MVP Demo</div>
          )}
        </div>
      </header>

      {/* Breadcrumbs */}
      {currentView !== 'home' && <Breadcrumbs path={getBreadcrumbs()} />}

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'home' && (
          <div className="home-view">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Operator Mode */}
            <OperatorMode />

            <div className="welcome-card">
              <h2>{getBilingualText('welcome', language)}</h2>
              <p>{getBilingualText('welcomeSubtitle', language)}</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>{getBilingualText('location', language)}</p>
            </div>

            <div className="stats-row">
              <div className="stat-card" onClick={() => setCurrentView('equipment-list')}>
                <div className="stat-number">{stats.totalEquipment}</div>
                <div className="stat-label">{getBilingualText('equipmentTracked', language)}</div>
              </div>
              <div className="stat-card" onClick={() => setCurrentView('equipment-list')}>
                <div className="stat-number">{stats.totalLogs}</div>
                <div className="stat-label">{getBilingualText('maintenanceLogs', language)}</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #27ae60' }}>
                <div className="stat-number" style={{ color: '#27ae60' }}>
                  ${stats.totalCost?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                </div>
                <div className="stat-label">YTD Spend</div>
              </div>
            </div>

            {/* Upcoming Maintenance Alerts */}
            <div className="info-card" style={{ marginBottom: '20px', borderLeft: '4px solid #f39c12' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#d35400', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Upcoming Service Due
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff3e0', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>Industrial Shredder</span>
                  <span style={{ color: '#d35400' }}>Due {new Date(Date.now() + 86400000 * 2).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff3e0', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>Forklift #4</span>
                  <span style={{ color: '#d35400' }}>Due {new Date(Date.now() + 86400000 * 5).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="primary-button" onClick={() => setShowScanner(true)}>
                <span className="button-icon">📱</span>
                {getBilingualText('scanQR', language)}
              </button>
              <button className="primary-button" onClick={() => setCurrentView('equipment-list')}>
                <span className="button-icon">📋</span>
                {getBilingualText('browseEquipment', language)}
              </button>
              <button className="primary-button" onClick={() => setCurrentView('profile')} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <span className="button-icon">🏆</span>
                {getBilingualText('myProfile', language)}
              </button>
              <button className="primary-button" onClick={() => setCurrentView('leaderboard')} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <span className="button-icon">📊</span>
                {getBilingualText('leaderboard', language)}
              </button>
            </div>
          </div>
        )}

        {currentView === 'equipment-list' && (
          <EquipmentList
            onSelectEquipment={(equipment) => {
              setSelectedEquipment(equipment)
              setCurrentView('equipment-detail')
            }}
          />
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

        {currentView === 'profile' && <UserProfile />}

        {currentView === 'leaderboard' && <Leaderboard />}

        {currentView === 'about' && <AboutCimco onBack={handleBack} />}
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

      {/* Floating Action Button */}
      {currentView !== 'home' && (
        <FloatingActionButton
          onClick={() => setShowScanner(true)}
          icon="📱"
          label="Scan QR Code"
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Cimco Resources, Inc. - Sterling, Illinois</p>
        <p className="footer-subtitle">1616 Windsor Road, Loves Park, IL 61111</p>
        <div
          onClick={() => {
            const clicks = parseInt(localStorage.getItem('demo_clicks') || '0') + 1
            localStorage.setItem('demo_clicks', clicks)
            if (clicks >= 5) {
              const currentMode = localStorage.getItem('force_demo_mode') === 'true'
              localStorage.setItem('force_demo_mode', !currentMode)
              localStorage.setItem('demo_clicks', '0')
              alert(`Demo Mode: ${!currentMode ? 'ENABLED' : 'DISABLED'}`)
              window.location.reload()
            }
          }}
          style={{
            marginTop: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0,0,0,0.05)',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            color: '#27ae60',
            fontWeight: 'bold',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
          <span style={{ width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%', display: 'inline-block' }}></span>
          System Healthy • v1.0.4 • Mesh Active
        </div>
        <div style={{ marginTop: '15px' }}>
          <a
            href="mailto:ryan@cimcoresources.com?subject=App Issue Report&body=Please describe the issue:"
            style={{
              color: '#64748b',
              fontSize: '12px',
              textDecoration: 'none',
              border: '1px solid #e2e8f0',
              padding: '6px 12px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🐛 Report Issue
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
