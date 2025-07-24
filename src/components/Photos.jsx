import React, { useState, useEffect } from 'react'
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
  RefreshCw
} from 'lucide-react'

const Photos = () => {
  const [photos, setPhotos] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const [photoUpload, setPhotoUpload] = useState({
    photo: null,
    photoUrl: '',
    selectedTaskId: '',
    analysis: '',
    loading: false,
    showForm: false
  })

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

    try {
      setPhotoUpload({ ...photoUpload, loading: true, photo: file })
      
      // Upload to Supabase Storage
      const fileName = `project-photos/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      setPhotoUpload({ ...photoUpload, photoUrl: publicUrl, photo: file })
      
      // Analyze photo with Grok Pro API
      await analyzePhotoWithGrok(publicUrl)
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      showMessage('error', 'Failed to upload photo')
      setPhotoUpload({ ...photoUpload, loading: false, photo: null })
    }
  }

  const analyzePhotoWithGrok = async (photoUrl) => {
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

      const prompt = `Analyze this maintenance/repair photo and provide clarification on next steps or verification if the work is done correctly.

${taskContext}

Instructions:
1. If the work appears incomplete, provide specific next steps
2. If the work appears complete, confirm it's done correctly
3. Identify any issues or safety concerns
4. Provide specific instructions for next actions
5. Include any tools or supplies needed

Format your response as:
## Analysis
[Describe what you see and if it's correct/complete]

## Status
✅ Complete and Correct
⚠️ Needs Attention
🔄 In Progress

## Next Steps
[Specific instructions for next actions]

## Tools/Supplies Needed
[List any additional tools or supplies]

## Notes
[Additional observations or safety notes]`

      console.log('Sending photo analysis request to Grok Pro API...')

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

      // Save to Supabase photos table
      const { error: saveError } = await supabase
        .from('photos')
        .insert({
          user_id: 'current-user',
          photo_url: photoUrl,
          task_id: photoUpload.selectedTaskId || null,
          response: analysis,
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
      
      console.log('Photo uploaded and analyzed with Grok Pro')
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
    if (analysis.includes('✅ Complete and Correct')) {
      return <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
    } else if (analysis.includes('⚠️ Needs Attention')) {
      return <AlertCircle size={16} style={{ color: 'var(--warning-color)' }} />
    } else if (analysis.includes('🔄 In Progress')) {
      return <Clock size={16} style={{ color: 'var(--primary-color)' }} />
    }
    return <FileText size={16} />
  }

  const getStatusColor = (analysis) => {
    if (analysis.includes('✅ Complete and Correct')) {
      return 'var(--success-color)'
    } else if (analysis.includes('⚠️ Needs Attention')) {
      return 'var(--warning-color)'
    } else if (analysis.includes('🔄 In Progress')) {
      return 'var(--primary-color)'
    }
    return 'var(--secondary-color)'
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
        <h3>Upload Photo for Clarification</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Upload a photo to get clarification on next steps or verify if work is done correctly.
        </p>
        
        {!photoUpload.showForm ? (
          <button
            className="btn"
            onClick={() => setPhotoUpload({ ...photoUpload, showForm: true })}
          >
            <Camera size={16} style={{ marginRight: '0.5rem' }} />
            Upload Photo
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPhotoUpload({ 
                  ...photoUpload, 
                  showForm: false, 
                  photo: null, 
                  photoUrl: '', 
                  analysis: '',
                  selectedTaskId: ''
                })}
              >
                <X size={16} style={{ marginRight: '0.5rem' }} />
                Cancel
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Link to Task (optional)</label>
              <select
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
                Analyzing photo with Grok Pro...
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
                  fontSize: '0.9rem'
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
          >
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
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
                    >
                      <Trash2 size={14} />
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
                        overflow: 'auto'
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