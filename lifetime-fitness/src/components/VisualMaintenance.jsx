import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import './VisualMaintenance.css';

const VisualMaintenance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    issue: '',
    urgency: 'normal'
  });
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const analyzePhoto = async () => {
    if (!photo) {
      alert('Please upload a photo first');
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('photo', photo);
      uploadFormData.append('location', formData.location || 'Gym Equipment');
      uploadFormData.append('issue', formData.issue || 'Maintenance check');
      uploadFormData.append('urgency', formData.urgency || 'normal');

      // Use local backend API endpoint
      const apiUrl = 'http://localhost:3001/api/workflow/analyze-photo';
      
      console.log('🔍 Sending photo for AI analysis to local backend...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: uploadFormData // Send as FormData for file upload
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.data);
        console.log('✅ Photo analysis completed successfully');
        alert('Photo analyzed successfully! Check the results below.');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Fallback to demo analysis if local API fails
      console.log('⚠️ Using demo analysis due to API error:', error.message);
      
      const demoAnalysis = {
        equipment_type: 'Treadmill',
        brand: 'Life Fitness',
        model: '95T',
        issues_detected: ['Belt wear', 'Motor noise'],
        severity: 'medium',
        time_estimate: '2-3 hours',
        cost_estimate: 150,
        maintenance_recommendations: [
          'Replace worn belt',
          'Lubricate motor bearings',
          'Check electrical connections'
        ],
        parts_needed: [
          { part_number: 'GR123', description: 'Treadmill Belt', price: 89.99 },
          { part_number: 'GR456', description: 'Motor Bearings', price: 45.50 }
        ]
      };
      
      setAnalysis(demoAnalysis);
      alert('Demo analysis loaded (local API unavailable). Check the results below.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateOrder = async () => {
    if (!analysis) {
      alert('Please analyze a photo first');
      return;
    }

    try {
      // Here you would integrate with your order generation system
      // For now, we'll just show the order summary
      const orderSummary = {
        po_number: analysis.purchase_order?.po_number || 'PO-' + Date.now(),
        total_cost: analysis.purchase_order?.total || 0,
        parts_count: analysis.parts_lookup?.grainger_parts?.length || 0,
        estimated_time: analysis.ai_analysis?.time_estimate || 'Unknown'
      };

      alert(`Order Generated!\nPO Number: ${orderSummary.po_number}\nTotal Cost: $${orderSummary.total_cost}\nParts: ${orderSummary.parts_count}\nTime: ${orderSummary.estimated_time}`);
      
    } catch (error) {
      console.error('Order generation error:', error);
      alert('Failed to generate order. Please try again.');
    }
  };

  const resetForm = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setAnalysis(null);
    setFormData({
      location: '',
      issue: '',
      urgency: 'normal'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="visual-maintenance">
      <div className="maintenance-header">
        <h2>🔧 Visual Maintenance Assistant</h2>
        <p>Upload equipment photos for AI-powered maintenance analysis</p>
      </div>

      <div className="maintenance-container">
        {/* Photo Upload Section */}
        <div className="upload-section">
          <h3>📸 Equipment Photo</h3>
          <div className="photo-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="photo-input"
            />
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Equipment preview" />
                <button onClick={() => setPhoto(null)} className="remove-photo">
                  ✕ Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <h3>📋 Maintenance Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Equipment Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Cardio Room, Weight Room, Pool Area"
              />
            </div>
            
            <div className="form-group">
              <label>Reported Issue:</label>
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleInputChange}
                placeholder="Describe the problem or maintenance need..."
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Urgency Level:</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
              >
                <option value="low">Low - Routine maintenance</option>
                <option value="normal">Normal - Standard repair</option>
                <option value="high">High - Equipment down</option>
                <option value="critical">Critical - Safety issue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={analyzePhoto}
            disabled={!photo || isLoading}
            className="analyze-btn"
          >
            {isLoading ? '🔍 Analyzing...' : '🔍 Analyze Photo'}
          </button>
          
          {analysis && (
            <button
              onClick={generateOrder}
              className="order-btn"
            >
              📋 Generate Order
            </button>
          )}
          
          <button
            onClick={resetForm}
            className="reset-btn"
          >
            🔄 Reset
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="analysis-results">
            <h3>📊 AI Analysis Results</h3>
            
            <div className="results-grid">
              <div className="result-card">
                <h4>Equipment Analysis</h4>
                <p><strong>Type:</strong> {analysis.ai_analysis?.equipment_type || 'Unknown'}</p>
                <p><strong>Damage:</strong> {analysis.ai_analysis?.damage_assessment || 'No damage detected'}</p>
                <p><strong>Safety:</strong> {analysis.ai_analysis?.safety_concerns || 'No safety concerns'}</p>
              </div>
              
              <div className="result-card">
                <h4>Maintenance Details</h4>
                <p><strong>Time Estimate:</strong> {analysis.ai_analysis?.time_estimate || 'Unknown'}</p>
                <p><strong>Tools Needed:</strong> {analysis.ai_analysis?.tools_needed || 'Standard tools'}</p>
                <p><strong>Parts Required:</strong> {analysis.parts_lookup?.grainger_parts?.length || 0} items</p>
              </div>
              
              {analysis.purchase_order && (
                <div className="result-card">
                  <h4>Purchase Order</h4>
                  <p><strong>PO Number:</strong> {analysis.purchase_order.po_number}</p>
                  <p><strong>Total Cost:</strong> ${analysis.purchase_order.total}</p>
                  <p><strong>Vendor:</strong> {analysis.purchase_order.vendor}</p>
                </div>
              )}
            </div>

            {/* Parts List */}
            {analysis.parts_lookup?.grainger_parts?.length > 0 && (
              <div className="parts-list">
                <h4>🛠️ Required Parts</h4>
                <div className="parts-grid">
                  {analysis.parts_lookup.grainger_parts.map((part, index) => (
                    <div key={index} className="part-item">
                      <p><strong>{part.part_number}</strong></p>
                      <p>{part.description}</p>
                      <p className="price">${part.price}</p>
                      <p className="availability">{part.availability}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualMaintenance; 