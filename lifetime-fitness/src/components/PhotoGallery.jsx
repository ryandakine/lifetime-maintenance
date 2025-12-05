import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

const PhotoGallery = ({ taskId, onPhotoSelect, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchPhotos();
  }, [taskId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const url = taskId 
        ? `http://localhost:3001/api/photos/tasks/${taskId}/photos`
        : 'http://localhost:3001/api/photos';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setPhotos(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch photos');
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async (photoId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context: {
            equipmentType: 'Fitness Equipment',
            taskDescription: 'Maintenance inspection'
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh photos to get updated analysis
        fetchPhotos();
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('AI Analysis error:', err);
      throw err;
    }
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPhotos(photos.filter(photo => photo.id !== photoId));
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
  };

  const filteredPhotos = photos
    .filter(photo => {
      // Filter by status
      if (filter === 'analyzed' && !photo.ai_analysis) return false;
      if (filter === 'pending' && photo.ai_analysis) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const description = photo.description?.toLowerCase() || '';
        const analysis = photo.ai_analysis ? JSON.stringify(photo.ai_analysis).toLowerCase() : '';
        return description.includes(searchLower) || analysis.includes(searchLower);
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.upload_date) - new Date(a.upload_date);
        case 'size':
          return b.file_size - a.file_size;
        case 'name':
          return a.file_name.localeCompare(b.file_name);
        default:
          return 0;
      }
    });

  const renderPhotoCard = (photo) => {
    const hasAnalysis = photo.ai_analysis && typeof photo.ai_analysis === 'object';
    const analysis = hasAnalysis ? photo.ai_analysis : null;
    
    return (
      <div 
        key={photo.id} 
        className={`photo-card ${selectedPhoto?.id === photo.id ? 'selected' : ''}`}
        onClick={() => setSelectedPhoto(photo)}
      >
        <div className="photo-thumbnail">
          <img 
            src={`http://localhost:3001${photo.url}`} 
            alt={photo.description || 'Maintenance photo'}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          <div className="photo-overlay">
            <button 
              className="analyze-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerAIAnalysis(photo.id);
              }}
              disabled={hasAnalysis}
            >
              {hasAnalysis ? '✅ Analyzed' : '🤖 Analyze'}
            </button>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deletePhoto(photo.id);
              }}
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div className="photo-info">
          <h4>{photo.description || 'No description'}</h4>
          <p>📅 {new Date(photo.upload_date).toLocaleDateString()}</p>
          <p>📏 {(photo.file_size / 1024).toFixed(1)} KB</p>
          
          {hasAnalysis && (
            <div className="analysis-summary">
              <p><strong>Equipment:</strong> {analysis.equipmentType}</p>
              <p><strong>Priority:</strong> {analysis.priority}</p>
              <p><strong>Safety:</strong> {analysis.safetyLevel}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPhotoDetail = (photo) => {
    const hasAnalysis = photo.ai_analysis && typeof photo.ai_analysis === 'object';
    const analysis = hasAnalysis ? photo.ai_analysis : null;
    
    return (
      <div className="photo-detail">
        <div className="detail-header">
          <h3>📸 Photo Details</h3>
          <button className="close-detail" onClick={() => setSelectedPhoto(null)}>×</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-image">
            <img 
              src={`http://localhost:3001${photo.url}`} 
              alt={photo.description || 'Maintenance photo'}
            />
          </div>
          
          <div className="detail-info">
            <h4>📋 Basic Information</h4>
            <p><strong>Description:</strong> {photo.description || 'No description'}</p>
            <p><strong>Upload Date:</strong> {new Date(photo.upload_date).toLocaleString()}</p>
            <p><strong>File Size:</strong> {(photo.file_size / 1024).toFixed(1)} KB</p>
            <p><strong>File Type:</strong> {photo.mime_type}</p>
            
            {photo.task_id && <p><strong>Task ID:</strong> {photo.task_id}</p>}
            {photo.equipment_id && <p><strong>Equipment ID:</strong> {photo.equipment_id}</p>}
          </div>
          
          {hasAnalysis ? (
            <div className="detail-analysis">
              <h4>🤖 AI Analysis Results</h4>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <strong>Equipment Type:</strong>
                  <span>{analysis.equipmentType}</span>
                </div>
                <div className="analysis-item">
                  <strong>Priority Level:</strong>
                  <span className={`priority-${analysis.priority.toLowerCase()}`}>
                    {analysis.priority}
                  </span>
                </div>
                <div className="analysis-item">
                  <strong>Safety Level:</strong>
                  <span className={`safety-${analysis.safetyLevel.toLowerCase()}`}>
                    {analysis.safetyLevel}
                  </span>
                </div>
                <div className="analysis-item">
                  <strong>Estimated Time:</strong>
                  <span>{analysis.estimatedTime}</span>
                </div>
              </div>
              
              <div className="analysis-sections">
                <div className="analysis-section">
                  <h5>🔍 Issues Identified:</h5>
                  <ul>
                    {analysis.issues?.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="analysis-section">
                  <h5>🛠️ Recommendations:</h5>
                  <ul>
                    {analysis.recommendations?.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="analysis-section">
                  <h5>🔧 Parts Needed:</h5>
                  <ul>
                    {analysis.partsNeeded?.map((part, index) => (
                      <li key={index}>{part}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-analysis">
              <h4>🤖 AI Analysis</h4>
              <p>No analysis performed yet.</p>
              <button 
                className="analyze-btn-large"
                onClick={() => triggerAIAnalysis(photo.id)}
              >
                🚀 Start AI Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="photo-gallery-overlay">
        <div className="photo-gallery-modal">
          <div className="loading">🔄 Loading photos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-gallery-overlay">
      <div className="photo-gallery-modal">
        <div className="gallery-header">
          <h2>📸 Photo Gallery</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="gallery-controls">
          <div className="search-filter">
            <input
              type="text"
              placeholder="🔍 Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Photos</option>
              <option value="analyzed">Analyzed</option>
              <option value="pending">Pending Analysis</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
          
          <div className="gallery-stats">
            <span>📊 {filteredPhotos.length} of {photos.length} photos</span>
          </div>
        </div>

        <div className="gallery-content">
          {selectedPhoto ? (
            renderPhotoDetail(selectedPhoto)
          ) : (
            <div className="photo-grid">
              {filteredPhotos.length > 0 ? (
                filteredPhotos.map(renderPhotoCard)
              ) : (
                <div className="no-photos">
                  <p>📷 No photos found</p>
                  {searchTerm && <p>Try adjusting your search terms</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery; 