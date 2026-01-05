import React, { useState, useEffect } from 'react'
import { getEquipment } from '../lib/api'
import { MOCK_EQUIPMENT } from '../utils/mockData'

export default function EquipmentList({ onSelectEquipment }) {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      // Check for forced demo mode
      if (localStorage.getItem('force_demo_mode') === 'true') {
        throw new Error('Demo Mode Forced')
      }

      const data = await getEquipment();

      // Map API data to component expectations
      const mappedData = data.map(item => ({
        equipment_id: item.id,
        equipment_name: item.name,
        status: item.status.toLowerCase(),
        health_score: Math.round(item.health_score),
        // Defaults for fields missing in MVP API
        equipment_type: inferType(item.name),
        location_zone: 'Factory Floor',
        qr_code_id: `EQ-${item.id.toString().padStart(4, '0')}`,
        description: 'Industrial Equipment',
      }));

      setEquipment(mappedData || [])
    } catch (err) {
      console.error('Error fetching equipment:', err)
      // Fallback to mock data for demo stability
      console.log('Falling back to mock equipment')
      setEquipment(MOCK_EQUIPMENT)
    } finally {
      setLoading(false)
    }
  }

  const inferType = (name) => {
    const n = name.toLowerCase();
    if (n.includes('shredder')) return 'Shredder';
    if (n.includes('crane')) return 'Crane';
    if (n.includes('conveyor')) return 'Conveyor';
    if (n.includes('baler')) return 'Baler';
    if (n.includes('forklift')) return 'Forklift';
    return 'Machine';
  }

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      maintenance: '#f59e0b',
      down: '#ef4444',
      retired: '#64748b'
    }
    return colors[status] || '#3b82f6'
  }

  const getEquipmentIcon = (type) => {
    const icons = {
      'Shredder': '🏭',
      'Crane': '🏗️',
      'Conveyor': '📦',
      'Baler': '🗜️',
      'Forklift': '🚜',
      'Machine': '⚙️'
    }
    return icons[type] || '⚙️'
  }

  const filteredEquipment = filter === 'all'
    ? equipment
    : equipment.filter(e => e.status === filter)

  return (
    <div className="equipment-list">
      <div className="list-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Equipment Fleet</h2>
          <p className="list-subtitle" style={{ color: 'var(--text-secondary)' }}>{equipment.length} active units modeled</p>
        </div>
        <button
          className="primary-button"
          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          onClick={() => fetchEquipment()}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="filter-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['all', 'active', 'maintenance', 'down'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: filter === f ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background: filter === f ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: filter === f ? '#000' : 'var(--text-secondary)',
              textTransform: 'capitalize',
              fontWeight: 600
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="loading">Initializing digital twin connection...</div>
      ) : filteredEquipment.length === 0 ? (
        <div className="empty-state">
          <p>No equipment matching filter</p>
        </div>
      ) : (
        <div className="equipment-grid">
          {filteredEquipment.map((item) => (
            <div
              key={item.equipment_id}
              className="equipment-card"
              onClick={() => onSelectEquipment(item)}
            >
              <div className="card-icon">
                {getEquipmentIcon(item.equipment_type)}
              </div>
              <div className="card-content">
                <h3>{item.equipment_name}</h3>
                <p className="card-type">{item.equipment_type} • {item.location_zone}</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div
                    className={`card-status ${item.status}`}
                  >
                    {item.status}
                  </div>
                  {/* AI Health Badge */}
                  <div
                    className="card-status"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa'
                    }}
                  >
                    🤖 {item.health_score}% Health
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
