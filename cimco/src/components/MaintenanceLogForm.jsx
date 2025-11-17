import React, { useState, useRef } from 'react'
import { supabase, uploadMaintenancePhoto, compressImage } from '../lib/supabase'

export default function MaintenanceLogForm({ equipment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    work_date: new Date().toISOString().split('T')[0],
    worker_name: '',
    work_type: 'preventive',
    work_description: '',
    parts_used: '',
    hours_spent: '',
    cost: ''
  })
  const [photos, setPhotos] = useState([])
  const [photoPreview, setPhotoPreview] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed')
      return
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreview(prev => [...prev, ...newPreviews])
    setPhotos(prev => [...prev, ...files])
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreview(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setUploading(true)

    try {
      // Upload photos first
      const photoUrls = []
      for (const photo of photos) {
        const compressed = await compressImage(photo)
        const url = await uploadMaintenancePhoto(compressed, equipment.equipment_id)
        photoUrls.push(url)
      }

      // Insert maintenance log
      const { data, error: insertError } = await supabase
        .from('maintenance_logs')
        .insert({
          equipment_id: equipment.equipment_id,
          work_date: formData.work_date,
          worker_name: formData.worker_name,
          work_type: formData.work_type,
          work_description: formData.work_description,
          parts_used: formData.parts_used || null,
          hours_spent: formData.hours_spent || null,
          cost: formData.cost || null,
          photo_urls: photoUrls.length > 0 ? photoUrls : null
        })
        .select()

      if (insertError) throw insertError

      // Clean up preview URLs
      photoPreview.forEach(url => URL.revokeObjectURL(url))

      onSubmit()
    } catch (err) {
      console.error('Error submitting maintenance log:', err)
      setError('Failed to submit maintenance log. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="maintenance-form">
      <div className="form-header">
        <h2>Log Maintenance</h2>
        <div className="form-equipment-badge">{equipment.equipment_name}</div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="work_date">Work Date *</label>
          <input
            type="date"
            id="work_date"
            name="work_date"
            value={formData.work_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="worker_name">Worker Name *</label>
          <input
            type="text"
            id="worker_name"
            name="worker_name"
            value={formData.worker_name}
            onChange={handleChange}
            placeholder="e.g., Mike Johnson"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="work_type">Work Type *</label>
          <select
            id="work_type"
            name="work_type"
            value={formData.work_type}
            onChange={handleChange}
            required
          >
            <option value="preventive">🔧 Preventive Maintenance</option>
            <option value="repair">🔨 Repair</option>
            <option value="inspection">🔍 Inspection</option>
            <option value="emergency">🚨 Emergency</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="work_description">Work Description *</label>
          <textarea
            id="work_description"
            name="work_description"
            value={formData.work_description}
            onChange={handleChange}
            placeholder="Describe the maintenance work performed..."
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="parts_used">Parts Used</label>
          <textarea
            id="parts_used"
            name="parts_used"
            value={formData.parts_used}
            onChange={handleChange}
            placeholder="List parts used (optional)"
            rows={2}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hours_spent">Hours Spent</label>
            <input
              type="number"
              id="hours_spent"
              name="hours_spent"
              value={formData.hours_spent}
              onChange={handleChange}
              placeholder="e.g., 2.5"
              step="0.1"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost ($)</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="e.g., 150.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label>Photos (Max 5)</label>
          <div className="photo-upload-buttons">
            <button
              type="button"
              className="upload-button"
              onClick={() => cameraInputRef.current.click()}
            >
              📷 Take Photo
            </button>
            <button
              type="button"
              className="upload-button"
              onClick={() => fileInputRef.current.click()}
            >
              🖼️ Choose Files
            </button>
          </div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
            multiple
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
            multiple
          />
        </div>

        {/* Photo Previews */}
        {photoPreview.length > 0 && (
          <div className="photo-previews">
            {photoPreview.map((url, index) => (
              <div key={index} className="photo-preview">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-photo"
                  onClick={() => removePhoto(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={uploading}
          >
            {uploading ? 'Submitting...' : 'Submit Maintenance Log'}
          </button>
        </div>
      </form>
    </div>
  )
}
