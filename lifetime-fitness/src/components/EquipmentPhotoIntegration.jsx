import React, { useState, useEffect } from 'react';
import './EquipmentPhotoIntegration.css';

const EquipmentPhotoIntegration = ({ equipmentId, onPhotoSelect }) => {
  const [equipment, setEquipment] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [conditionScore, setConditionScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('all'); // all, maintenance, issues, before-after

  useEffect(() => {
    if (equipmentId) {
      loadEquipmentData();
    }
  }, [equipmentId]);

  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      
      // Load equipment details
      const equipmentResponse = await fetch(`/api/equipment/${equipmentId}`);
      const equipmentData = await equipmentResponse.json();
      setEquipment(equipmentData.data);

      // Load equipment photos
      const photosResponse = await fetch(`/api/photos?equipment_id=${equipmentId}`);
      const photosData = await photosResponse.json();
      setPhotos(photosData.data || []);

      // Load maintenance history
      const maintenanceResponse = await fetch(`/api/tasks?equipment_id=${equipmentId}`);
      const maintenanceData = await maintenanceResponse.json();
      setMaintenanceHistory(maintenanceData.data || []);

      // Calculate condition score
      calculateConditionScore(photosData.data || []);

    } catch (error) {
      console.error('Failed to load equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConditionScore = (equipmentPhotos) => {
    if (!equipmentPhotos.length) {
      setConditionScore(0);
      return;
    }

    let totalScore = 0;
    let analyzedPhotos = 0;

    equipmentPhotos.forEach(photo => {
      if (photo.ai_analysis) {
        const analysis = JSON.parse(photo.ai_analysis);
        const condition = analysis.assessment?.overallCondition;
        
        switch (condition) {
          case 'Excellent':
            totalScore += 100;
            break;
          case 'Good':
            totalScore += 80;
            break;
          case 'Fair':
            totalScore += 60;
            break;
          case 'Poor':
            totalScore += 30;
            break;
          default:
            totalScore += 50;
        }
        analyzedPhotos++;
      }
    });

    const averageScore = analyzedPhotos > 0 ? totalScore / analyzedPhotos : 0;
    setConditionScore(Math.round(averageScore));
  };

  const getConditionColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const getConditionLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const filterPhotos = (photoList) => {
    switch (filter) {
      case 'maintenance':
        return photoList.filter(photo => 
          photo.description?.toLowerCase().includes('maintenance') ||
          photo.task_id
        );
      case 'issues':
        return photoList.filter(photo => {
          if (!photo.ai_analysis) return false;
          const analysis = JSON.parse(photo.ai_analysis);
          return analysis.damages?.totalIssues > 0 || analysis.assessment?.priority === 'High';
        });
      case 'before-after':
        return photoList.filter(photo => 
          photo.description?.toLowerCase().includes('before') ||
          photo.description?.toLowerCase().includes('after')
        );
      default:
        return photoList;
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    if (onPhotoSelect) {
      onPhotoSelect(photo);
    }
  };

  const createMaintenanceReport = async () => {
    try {
      const reportData = {
        equipmentId,
        photos: photos,
        maintenanceHistory,
        conditionScore,
        generatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/equipment/reports/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maintenance-report-${equipment?.name}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const comparePhotos = (photo1, photo2) => {
    // Implementation for photo comparison
    console.log('Comparing photos:', photo1.id, photo2.id);
  };

  if (loading) {
    return (
      <div className="equipment-integration-container">
        <div className="loading">🔄 Loading equipment data...</div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="equipment-integration-container">
        <div className="error">❌ Equipment not found</div>
      </div>
    );
  }

  const filteredPhotos = filterPhotos(photos);

  return (
    <div className="equipment-integration-container">
      {/* Equipment Header */}
      <div className="equipment-header">
        <div className="equipment-info">
          <h2>🔧 {equipment.name}</h2>
          <p className="equipment-type">{equipment.type}</p>
          <p className="equipment-location">📍 {equipment.location}</p>
        </div>
        
        <div className="condition-indicator">
          <div 
            className="condition-circle"
            style={{ backgroundColor: getConditionColor(conditionScore) }}
          >
            <span className="condition-score">{conditionScore}</span>
          </div>
          <span className="condition-label">{getConditionLabel(conditionScore)}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="equipment-stats">
        <div className="stat-item">
          <span className="stat-number">{photos.length}</span>
          <span className="stat-label">Total Photos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{maintenanceHistory.length}</span>
          <span className="stat-label">Maintenance Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {photos.filter(p => p.ai_analysis).length}
          </span>
          <span className="stat-label">AI Analyzed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {maintenanceHistory.filter(t => t.status === 'completed').length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Photo Filters */}
      <div className="photo-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          📸 All Photos ({photos.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
          onClick={() => setFilter('maintenance')}
        >
          🔧 Maintenance ({filterPhotos(photos).length})
        </button>
        <button 
          className={`filter-btn ${filter === 'issues' ? 'active' : ''}`}
          onClick={() => setFilter('issues')}
        >
          ⚠️ Issues ({filterPhotos(photos).length})
        </button>
        <button 
          className={`filter-btn ${filter === 'before-after' ? 'active' : ''}`}
          onClick={() => setFilter('before-after')}
        >
          📊 Before/After ({filterPhotos(photos).length})
        </button>
      </div>

      {/* Photo Gallery */}
      <div className="photo-gallery">
        {filteredPhotos.length === 0 ? (
          <div className="no-photos">
            📷 No photos found for this filter
          </div>
        ) : (
          filteredPhotos.map(photo => (
            <div 
              key={photo.id} 
              className="photo-item"
              onClick={() => handlePhotoClick(photo)}
            >
              <img src={photo.file_path || photo.image} alt={photo.description} />
              <div className="photo-overlay">
                <div className="photo-date">
                  {new Date(photo.upload_date || photo.timestamp).toLocaleDateString()}
                </div>
                {photo.ai_analysis && (
                  <div className="ai-indicator">🤖</div>
                )}
                {photo.task_id && (
                  <div className="task-indicator">📋</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Maintenance Timeline */}
      <div className="maintenance-timeline">
        <h3>📅 Maintenance Timeline</h3>
        <div className="timeline">
          {maintenanceHistory.map(task => (
            <div key={task.id} className="timeline-item">
              <div className="timeline-date">
                {new Date(task.creation_date).toLocaleDateString()}
              </div>
              <div className="timeline-content">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <span className={`status-badge ${task.status}`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={createMaintenanceReport} className="btn-primary">
          📄 Generate Report
        </button>
        <button onClick={() => window.print()} className="btn-secondary">
          🖨️ Print View
        </button>
        <button onClick={() => setSelectedPhoto(null)} className="btn-secondary">
          📊 Photo Comparison
        </button>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.file_path || selectedPhoto.image} alt="Selected" />
            <div className="modal-info">
              <h3>Photo Details</h3>
              <p><strong>Date:</strong> {new Date(selectedPhoto.upload_date || selectedPhoto.timestamp).toLocaleString()}</p>
              <p><strong>Description:</strong> {selectedPhoto.description || 'No description'}</p>
              {selectedPhoto.ai_analysis && (
                <div className="ai-analysis">
                  <h4>🤖 AI Analysis</h4>
                  <pre>{JSON.stringify(JSON.parse(selectedPhoto.ai_analysis), null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPhotoIntegration; 