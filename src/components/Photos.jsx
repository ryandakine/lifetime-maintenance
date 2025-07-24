import React, { useState, useEffect, useRef } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Camera, 
  Upload, 
  Check, 
  X, 
  Brain,
  RotateCcw,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Video,
  Image,
  HelpCircle,
  ArrowRight,
  Shield
} from 'lucide-react'

const Photos = () => {
  console.log('Rendering Photos')
  const [photos, setPhotos] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const [photoUpload, setPhotoUpload] = useState({
    photo: null,
    photoUrl: '',
    selectedTaskId: '',
    purpose: 'clarification', // 'clarification', 'next_steps', 'verify_done'
    analysis: '',
    loading: false,
    showForm: false,
    cameraMode: false,
    cameraAvailable: false,
    stream: null,
    uploadMode: 'file', // 'camera' or 'file'
    uploadType: 'file' // 'camera' or 'file' for database
  })

  // Check camera availability on mount
  useEffect(() => {
    checkCameraAvailability()
  }, [])

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load photos and tasks on component mount
  useEffect(() => {
    loadPhotos()
    loadTasks()
  }, [])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (photoUpload.stream) {
        photoUpload.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [photoUpload.stream])

  const checkCameraAvailability = () => {
    const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    const cameraAvailable = hasMediaDevices && navigator.mediaDevices.enumerateDevices
    
    console.log('Camera access: ' + (hasMediaDevices ? 'available' : 'not available'))
    
    setPhotoUpload(prev => ({ ...prev, cameraAvailable }))
    
    if (!hasMediaDevices) {
      showMessage('warning', 'Camera not available, upload from files')
    }
  }

  const handleUploadModeChange = (mode) => {
    console.log('Upload mode: ' + mode)
    
    // Stop camera if switching from camera mode
    if (photoUpload.cameraMode && mode === 'file') {
      stopCamera()
    }
    
    setPhotoUpload(prev => ({ 
      ...prev, 
      uploadMode: mode,
      uploadType: mode,
      cameraMode: mode === 'camera',
      photo: null,
      photoUrl: '',
      analysis: ''
    }))
  }

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'clarification': return 'Clarification'
      case 'next_steps': return 'Next Steps'
      case 'verify_done': return 'Verify Done'
      default: return 'Clarification'
    }
  }

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'clarification': return <HelpCircle size={16} />
      case 'next_steps': return <ArrowRight size={16} />
      case 'verify_done': return <Shield size={16} />
      default: return <HelpCircle size={16} />
    }
  }

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setPhotoUpload(prev => ({ 
        ...prev, 
        cameraMode: true, 
        stream,
        showForm: true 
      }))
      
      console.log('Camera started successfully')
      
    } catch (error) {
      console.error('Camera access error:', error)
      showMessage('error', 'Camera access failed, using file upload instead')
      setPhotoUpload(prev => ({ 
        ...prev, 
        cameraMode: false, 
        uploadMode: 'file',
        uploadType: 'file',
        showForm: true 
      }))
    }
  }

  const stopCamera = () => {
    if (photoUpload.stream) {
      photoUpload.stream.getTracks().forEach(track => track.stop())
    }
    
    setPhotoUpload(prev => ({ 
      ...prev, 
      cameraMode: false, 
      stream: null,
      showForm: false,
      photo: null,
      photoUrl: '',
      analysis: '',
      selectedTaskId: '',
      uploadMode: 'file',
      uploadType: 'file'
    }))
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        setPhotoUpload(prev => ({ ...prev, photo: file }))
        
        // Stop camera after capture
        stopCamera()
        
        // Process the captured photo
        processPhotoFile(file, 'camera')
      }
    }, 'image/jpeg', 0.8)
  }

  const processPhotoFile = async (file, type = 'file') => {
    try {
      setPhotoUpload(prev => ({ ...prev, loading: true }))
      
      // Upload to Supabase Storage
      const fileName = `project-photos/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      setPhotoUpload(prev => ({ ...prev, photoUrl: publicUrl }))
      
      // Analyze photo with Grok Pro API based on purpose
      await analyzePhotoWithGrok(publicUrl, type, photoUpload.purpose)
      
    } catch (error) {
      console.error('Error processing photo:', error)
      showMessage('error', 'Failed to process photo')
      setPhotoUpload(prev => ({ ...prev, loading: false }))
    }
  }

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', 'current-user') // Replace with actual user ID
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
      console.log('Photos loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading photos:', error)
      showMessage('error', 'Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('id, task_list, status')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    await processPhotoFile(file, 'file')
  }

  const analyzePhotoWithGrok = async (photoUrl, type = 'file', purpose = 'clarification') => {
    try {
      const grokApiKey = API_KEYS.GROK_PRO
      
      if (!grokApiKey || grokApiKey === 'your-grok-key') {
        console.warn('Grok Pro API key not configured, using fallback analysis')
        setPhotoUpload({ 
          ...photoUpload, 
          analysis: 'Photo analysis requires Grok Pro API key configuration.',
          loading: false 
        })
        return
      }

      // Get task context if selected
      let taskContext = ''
      if (photoUpload.selectedTaskId) {
        const task = tasks.find(t => t.id === photoUpload.selectedTaskId)
        if (task) {
          taskContext = `\n\nRelated Task: ${task.task_list}`
        }
      }

      // Generate purpose-specific prompt
      let prompt = ''
      switch (purpose) {
        case 'clarification':
          prompt = `Analyze this maintenance/repair photo and provide clarification about the issue or situation.

${taskContext}

Instructions:
1. Describe what you see in the photo
2. Identify the main issue or maintenance need
3. Explain what might be causing the problem
4. Provide context about the situation
5. Highlight any safety concerns

Format your response as:
## Issue Analysis
[Describe what you see and identify the main issue]

## Problem Description
[Explain what might be causing the problem]

## Context
[Provide additional context about the situation]

## Safety Notes
[Highlight any safety concerns or considerations]

## Questions for Clarification
[Ask specific questions to better understand the situation]`
          break

        case 'next_steps':
          prompt = `Analyze this maintenance/repair photo and provide specific next steps instructions.

${taskContext}

Instructions:
1. Identify what needs to be done next
2. Provide step-by-step instructions
3. List required tools and supplies
4. Include safety precautions
5. Estimate time and difficulty

Format your response as:
## Next Steps Required
[Identify what needs to be done next]

## Step-by-Step Instructions
1. [First step]
2. [Second step]
3. [Continue as needed]

## Required Tools & Supplies
[List all tools and supplies needed]

## Safety Precautions
[Include safety measures and precautions]

## Time & Difficulty Estimate
[Estimate time required and difficulty level]

## Additional Notes
[Any other important information]`
          break

        case 'verify_done':
          prompt = `Analyze this maintenance/repair photo and verify if the work has been completed correctly.

${taskContext}

Instructions:
1. Assess if the work appears complete and correct
2. Identify any issues or incomplete work
3. Suggest fixes if needed
4. Confirm quality of workmanship
5. Provide final recommendations

Format your response as:
## Work Verification
[Assess if the work appears complete and correct]

## Quality Assessment
[Evaluate the quality of workmanship]

## Issues Found (if any)
[List any issues or incomplete work]

## Suggested Fixes (if needed)
[Provide specific fixes for any issues]

## Final Status
✅ Work Complete and Correct
⚠️ Work Needs Attention
❌ Work Incomplete

## Recommendations
[Final recommendations and next actions]`
          break

        default:
          prompt = `Analyze this maintenance/repair photo and provide general guidance.`
      }

      console.log(`Photo analyzed for ${purpose}`)

      const response = await fetch('https://api.grok.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: photoUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Grok Pro API error:', response.status, errorText)
        throw new Error(`Grok Pro API error: ${response.status}`)
      }

      const result = await response.json()
      const analysis = result.choices[0].message.content

      // Save to Supabase photos table with purpose and upload type
      const { error: saveError } = await supabase
        .from('photos')
        .insert({
          user_id: 'current-user',
          photo_url: photoUrl,
          task_id: photoUpload.selectedTaskId || null,
          response: analysis,
          purpose: purpose,
          upload_type: type,
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving photo analysis:', saveError)
      }

      setPhotoUpload({ 
        ...photoUpload, 
        analysis, 
        loading: false 
      })
      
      console.log(`Photo uploaded and analyzed with Grok Pro (type: ${type}, purpose: ${purpose})`)
      showMessage('success', 'Photo uploaded and analyzed successfully')
      
      // Reload photos list
      await loadPhotos()
      
    } catch (error) {
      console.error('Error analyzing photo:', error)
      showMessage('error', 'Failed to analyze photo')
      setPhotoUpload({ ...photoUpload, loading: false })
    }
  }

  const deletePhoto = async (photoId) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error

      setPhotos(photos.filter(photo => photo.id !== photoId))
      console.log(`Photo ${photoId} deleted`)
      showMessage('success', 'Photo deleted')
    } catch (error) {
      console.error('Error deleting photo:', error)
      showMessage('error', 'Failed to delete photo')
    }
  }

  const getStatusIcon = (analysis) => {
    if (analysis.includes('✅ Work Complete and Correct') || analysis.includes('✅ Complete and Correct')) {
      return <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
    } else if (analysis.includes('⚠️ Work Needs Attention') || analysis.includes('⚠️ Needs Attention')) {
      return <AlertCircle size={16} style={{ color: 'var(--warning-color)' }} />
    } else if (analysis.includes('❌ Work Incomplete') || analysis.includes('🔄 In Progress')) {
      return <Clock size={16} style={{ color: 'var(--primary-color)' }} />
    }
    return <FileText size={16} />
  }

  const getStatusColor = (analysis) => {
    if (analysis.includes('✅ Work Complete and Correct') || analysis.includes('✅ Complete and Correct')) {
      return 'var(--success-color)'
    } else if (analysis.includes('⚠️ Work Needs Attention') || analysis.includes('⚠️ Needs Attention')) {
      return 'var(--warning-color)'
    } else if (analysis.includes('❌ Work Incomplete') || analysis.includes('🔄 In Progress')) {
      return 'var(--primary-color)'
    }
    return 'var(--secondary-color)'
  }

  const getUploadTypeIcon = (type) => {
    return type === 'camera' ? <Camera size={14} /> : <Upload size={14} />
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  return (
    <div className="container">
      {!isOnline && (
        <div className="offline-alert">
          ⚠️ You are currently offline. Some features may not work properly.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Photo Upload Section */}
      <div className="card">
        <h3>Upload Photo for Project Analysis</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Upload a photo to get clarification, next steps, or verify if work is done correctly.
        </p>
        
        {!photoUpload.showForm ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {photoUpload.cameraAvailable && (
              <button
                className="btn"
                onClick={() => {
                  handleUploadModeChange('camera')
                  startCamera()
                }}
                title="Use camera to take photo"
                aria-label="Use camera to take photo"
              >
                <Camera size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                Use Camera
              </button>
            )}
            <button
              className="btn"
              onClick={() => {
                handleUploadModeChange('file')
                setPhotoUpload(prev => ({ ...prev, showForm: true }))
              }}
              title="Upload photo from file"
              aria-label="Upload photo from file"
            >
              <Upload size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
              Upload File
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  stopCamera()
                  setPhotoUpload({ 
                    ...photoUpload, 
                    showForm: false, 
                    photo: null, 
                    photoUrl: '', 
                    analysis: '',
                    selectedTaskId: '',
                    uploadMode: 'file',
                    uploadType: 'file',
                    purpose: 'clarification'
                  })
                }}
              >
                <X size={16} style={{ marginRight: '0.5rem' }} />
                Cancel
              </button>
            </div>

            {/* Upload Mode Selection */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Upload Method</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: `2px solid ${photoUpload.uploadMode === 'camera' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  backgroundColor: photoUpload.uploadMode === 'camera' ? 'var(--primary-color)' : 'transparent',
                  color: photoUpload.uploadMode === 'camera' ? 'white' : 'var(--text-color)',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="camera"
                    checked={photoUpload.uploadMode === 'camera'}
                    onChange={(e) => handleUploadModeChange(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <Camera size={16} />
                  Use Camera
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: `2px solid ${photoUpload.uploadMode === 'file' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  backgroundColor: photoUpload.uploadMode === 'file' ? 'var(--primary-color)' : 'transparent',
                  color: photoUpload.uploadMode === 'file' ? 'white' : 'var(--text-color)',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="file"
                    checked={photoUpload.uploadMode === 'file'}
                    onChange={(e) => handleUploadModeChange(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <Upload size={16} />
                  Upload File
                </label>
              </div>
            </div>

            {/* Purpose Selection */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Analysis Purpose</label>
              <select
                className="form-input"
                value={photoUpload.purpose}
                onChange={(e) => setPhotoUpload({...photoUpload, purpose: e.target.value})}
              >
                <option value="clarification">
                  🔍 Clarification - Describe the issue
                </option>
                <option value="next_steps">
                  ➡️ Next Steps - Give instructions
                </option>
                <option value="verify_done">
                  ✅ Verify Done - Confirm if work is correct
                </option>
              </select>
            </div>
            
            {/* Camera Mode */}
            {photoUpload.cameraMode && (
              <div style={{ marginBottom: '1rem' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    borderRadius: '8px',
                    border: '2px solid var(--border-color)'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className="btn"
                    onClick={capturePhoto}
                    style={{ marginRight: '1rem' }}
                    title="Capture photo with camera"
                    aria-label="Capture photo with camera"
                  >
                    <Camera size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                    Capture Photo
                  </button>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="task-select-photos">Link to Task (optional)</label>
              <select
                id="task-select-photos"
                name="task-select-photos"
                className="form-input"
                value={photoUpload.selectedTaskId}
                onChange={(e) => setPhotoUpload({...photoUpload, selectedTaskId: e.target.value})}
              >
                <option value="">Select a task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.task_list} ({task.status})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Mode */}
            {!photoUpload.cameraMode && (
              <div className="form-group">
                <label className="form-label">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="form-input"
                  disabled={photoUpload.loading}
                />
              </div>
            )}

            {photoUpload.photo && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={URL.createObjectURL(photoUpload.photo)} 
                  alt="Uploaded" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                />
              </div>
            )}

            {photoUpload.loading && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Brain size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                Analyzing photo for {getPurposeLabel(photoUpload.purpose)}...
              </div>
            )}

            {photoUpload.analysis && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ 
                  backgroundColor: 'var(--light-color)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  border: '2px solid var(--primary-color)'
                }}>
                  {photoUpload.analysis}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photos List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Project Photos</h3>
          <button
            className="btn btn-secondary"
            onClick={loadPhotos}
            disabled={loading}
            title="Refresh photos"
            aria-label="Refresh photos"
          >
            <RotateCcw size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
            Refresh
          </button>
        </div>
        
        {loading && photos.length === 0 ? (
          <div className="loading">Loading photos...</div>
        ) : photos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No photos uploaded yet. Upload a photo above to get started!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {photos.map(photo => {
              const linkedTask = tasks.find(t => t.id === photo.task_id)
              
              return (
                <div key={photo.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: 'var(--light-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {getStatusIcon(photo.response)}
                        <span style={{ 
                          fontWeight: '600',
                          color: getStatusColor(photo.response)
                        }}>
                          Project Photo
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                          {new Date(photo.created_at).toLocaleDateString()}
                        </span>
                        {photo.purpose && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.8rem', 
                            color: 'var(--primary-color)',
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: '4px'
                          }}>
                            {getPurposeIcon(photo.purpose)}
                            {getPurposeLabel(photo.purpose)}
                          </span>
                        )}
                        {photo.upload_type && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.8rem', 
                            color: 'var(--primary-color)',
                            marginLeft: '0.5rem'
                          }}>
                            {getUploadTypeIcon(photo.upload_type)}
                            {photo.upload_type}
                          </span>
                        )}
                      </div>
                      
                      {linkedTask && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--primary-color)',
                          marginBottom: '0.5rem'
                        }}>
                          📋 Linked to: {linkedTask.task_list}
                        </div>
                      )}
                    </div>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => deletePhoto(photo.id)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      title="Delete photo"
                      aria-label="Delete photo"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <img 
                      src={photo.photo_url} 
                      alt="Project" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '2px solid var(--border-color)'
                      }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        backgroundColor: 'white', 
                        padding: '0.75rem', 
                        borderRadius: '6px',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        maxHeight: '120px',
                        overflow: 'auto',
                        border: '2px solid var(--primary-color)'
                      }}>
                        {photo.response}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Photos 