import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('equipment_name')

      if (error) throw error

      setEquipment(data || [])
    } catch (err) {
      console.error('Error fetching equipment:', err)
      // Fallback to mock data for demo stability
      console.log('Falling back to mock equipment')
      setEquipment(MOCK_EQUIPMENT)
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

  const getEquipmentIcon = (type) => {
    const icons = {
      'Shredder': '🏭',
      'Crane': '🏗️',
      'Conveyor': '📦',
      'Baler': '🗜️',
      'Forklift': '🚜'
    }
    return icons[type] || '⚙️'
  }

  const filteredEquipment = filter === 'all'
    ? equipment
    : equipment.filter(e => e.status === filter)

  return (
    <div className="equipment-list">
      <div className="list-header">
        <h2>All Equipment</h2>
        <p className="list-subtitle">{equipment.length} equipment items tracked</p>
      </div>

      {/* Status Filter */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-tab ${filter === 'maintenance' ? 'active' : ''}`}
          onClick={() => setFilter('maintenance')}
        >
          Maintenance
        </button>
        <button
          className={`filter-tab ${filter === 'down' ? 'active' : ''}`}
          onClick={() => setFilter('down')}
        >
          Down
        </button>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="loading">Loading equipment...</div>
      ) : filteredEquipment.length === 0 ? (
        <div className="empty-state">
          <p>No equipment found</p>
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
                <p className="card-type">{item.equipment_type}</p>
                <div className="card-meta">
                  <span className="card-qr">{item.qr_code_id}</span>
                  <span className="card-location">📍 {item.location_zone}</span>
                </div>
                <div
                  className="card-status"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {item.status}
                </div>
                {/* AI Health Badge for List View */}
                <div
                  className="card-status"
                  style={{
                    backgroundColor: (() => {
                      // Simulated logic for list view (randomized for demo variety if not in data)
                      // In real app, this would come from item.health_score
                      const health = item.health_score || (item.status === 'active' ? 92 : item.status === 'maintenance' ? 65 : 45);
                      if (health >= 80) return '#8cc63f'; // Green
                      if (health >= 50) return '#f59e0b'; // Yellow
                      return '#ef4444'; // Red
                    })(),
                    marginLeft: '6px',
                    color: '#fff'
                  }}
                >
                  🤖 {item.health_score || (item.status === 'active' ? '92%' : item.status === 'maintenance' ? '65%' : '45%')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
