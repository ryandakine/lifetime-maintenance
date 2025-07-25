import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  FileText, 
  Image, 
  FileVideo, 
  Music, 
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Cloud,
  CloudOff,
  RefreshCw,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Copy,
  Share2,
  MoreVertical,
  Folder,
  FolderOpen,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tag,
  Clock,
  Tool,
  Shield,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react'

const KnowledgeManager = () => {
  console.log('KnowledgeManager rendering!')
  
  // State management
  const [categories, setCategories] = useState([])
  const [knowledgeFiles, setKnowledgeFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [uploadProgress, setUploadProgress] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFiles, setFilteredFiles] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [currentVideo, setCurrentVideo] = useState(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [bulkUploadFiles, setBulkUploadFiles] = useState([])
  const [bulkUploadMetadata, setBulkUploadMetadata] = useState({})
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

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

  // Load data on component mount
  useEffect(() => {
    loadCategories()
    loadKnowledgeFiles()
  }, [])

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(knowledgeFiles)
    } else {
      const filtered = knowledgeFiles.filter(file => 
        file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        file.equipment_type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFiles(filtered)
    }
  }, [searchQuery, knowledgeFiles])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      showMessage('error', 'Failed to load categories')
    }
  }

  const loadKnowledgeFiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('knowledge_files')
        .select(`
          *,
          knowledge_categories(name, color, icon)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setKnowledgeFiles(data || [])
      setFilteredFiles(data || [])
    } catch (error) {
      console.error('Error loading knowledge files:', error)
      showMessage('error', 'Failed to load knowledge files')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (showBulkUpload) {
      setBulkUploadFiles(prev => [...prev, ...files])
    } else {
      uploadFiles(files)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (showBulkUpload) {
      setBulkUploadFiles(prev => [...prev, ...files])
    } else {
      uploadFiles(files)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const uploadFiles = async (filesToUpload) => {
    if (!isOnline) {
      showMessage('error', 'You are offline. Cannot upload files.')
      return
    }

    setUploading(true)
    const uploadPromises = filesToUpload.map(async (file) => {
      try {
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `knowledge/${fileName}`
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const { error: uploadError } = await supabase.storage
          .from('work-files')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100)
              setUploadProgress(prev => ({ ...prev, [file.name]: percent }))
            }
          })

        if (uploadError) throw uploadError

        // Create knowledge file record
        const { error: dbError } = await supabase
          .from('knowledge_files')
          .insert({
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: `Uploaded ${new Date().toLocaleDateString()}`,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            category_id: null
          })

        if (dbError) throw dbError

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        return { success: true, file: file.name }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        return { success: false, file: file.name, error: error.message }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    if (successful > 0) {
      showMessage('success', `Successfully uploaded ${successful} files${failed > 0 ? `, ${failed} failed` : ''}`)
      loadKnowledgeFiles()
    } else {
      showMessage('error', 'Failed to upload files')
    }

    setUploading(false)
    setUploadProgress({})
  }

  const bulkUploadFiles = async () => {
    if (bulkUploadFiles.length === 0) return

    setUploading(true)
    const uploadPromises = bulkUploadFiles.map(async (file) => {
      try {
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `knowledge/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('work-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Create knowledge file record with metadata
        const { error: dbError } = await supabase
          .from('knowledge_files')
          .insert({
            title: bulkUploadMetadata[file.name]?.title || file.name.replace(/\.[^/.]+$/, ''),
            description: bulkUploadMetadata[file.name]?.description || '',
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            category_id: bulkUploadMetadata[file.name]?.category_id || null,
            equipment_type: bulkUploadMetadata[file.name]?.equipment_type || null,
            maintenance_type: bulkUploadMetadata[file.name]?.maintenance_type || null,
            difficulty_level: bulkUploadMetadata[file.name]?.difficulty_level || 'beginner',
            estimated_time: bulkUploadMetadata[file.name]?.estimated_time || null,
            required_tools: bulkUploadMetadata[file.name]?.required_tools || [],
            required_materials: bulkUploadMetadata[file.name]?.required_materials || [],
            safety_notes: bulkUploadMetadata[file.name]?.safety_notes || null,
            tags: bulkUploadMetadata[file.name]?.tags || []
          })

        if (dbError) throw dbError
        return { success: true, file: file.name }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        return { success: false, file: file.name, error: error.message }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success).length

    if (successful > 0) {
      showMessage('success', `Successfully uploaded ${successful} files with metadata`)
      loadKnowledgeFiles()
      setShowBulkUpload(false)
      setBulkUploadFiles([])
      setBulkUploadMetadata({})
    }

    setUploading(false)
  }

  const downloadFile = async (filePath, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showMessage('success', 'File downloaded successfully')
    } catch (error) {
      console.error('Error downloading file:', error)
      showMessage('error', 'Failed to download file')
    }
  }

  const deleteFile = async (id, filePath) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('work-files')
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('knowledge_files')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      showMessage('success', 'File deleted successfully')
      loadKnowledgeFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      showMessage('error', 'Failed to delete file')
    }
  }

  const playVideo = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .createSignedUrl(file.file_path, 3600) // 1 hour expiry

      if (error) throw error

      setCurrentVideo({
        ...file,
        url: data.signedUrl
      })
    } catch (error) {
      console.error('Error loading video:', error)
      showMessage('error', 'Failed to load video')
    }
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const getFileIcon = (fileType, fileName) => {
    if (fileType.startsWith('video/')) return <FileVideo className="w-6 h-6 text-red-500" />
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-green-500" />
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />
    if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return <FileText className="w-6 h-6 text-blue-500" />
    }
    if (fileType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return <FileText className="w-6 h-6 text-green-600" />
    }
    if (fileType.includes('powerpoint') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return <FileText className="w-6 h-6 text-orange-500" />
    }
    return <File className="w-6 h-6 text-gray-500" />
  }

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const getFilesByCategory = (categoryId) => {
    return filteredFiles.filter(file => file.category_id === categoryId)
  }

  const getUncategorizedFiles = () => {
    return filteredFiles.filter(file => !file.category_id)
  }

  return (
    <div className="knowledge-manager">
      {/* Header */}
      <div className="header">
        <h1>📚 Knowledge Management</h1>
        <p>Access maintenance procedures, training videos, and company resources</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="search-controls">
          <div className="search-box">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="btn btn-secondary"
          >
            {showBulkUpload ? 'Cancel Bulk Upload' : 'Bulk Upload'}
          </button>
        </div>

        <div className="view-controls">
          <button
            onClick={() => setViewMode('grid')}
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Upload Interface */}
      {showBulkUpload && (
        <div className="bulk-upload-panel">
          <h3>📁 Bulk Upload with Metadata</h3>
          <div className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            className={dragActive ? 'drag-active' : ''}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload className="w-8 h-8" />
            <p>Drag files here or click to select</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
              Select Files
            </button>
          </div>

          {bulkUploadFiles.length > 0 && (
            <div className="bulk-files-list">
              <h4>Selected Files ({bulkUploadFiles.length})</h4>
              {bulkUploadFiles.map((file, index) => (
                <div key={index} className="bulk-file-item">
                  <div className="file-info">
                    {getFileIcon(file.type, file.name)}
                    <span>{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <div className="file-metadata">
                    <input
                      type="text"
                      placeholder="Title"
                      value={bulkUploadMetadata[file.name]?.title || ''}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], title: e.target.value }
                      }))}
                    />
                    <textarea
                      placeholder="Description"
                      value={bulkUploadMetadata[file.name]?.description || ''}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], description: e.target.value }
                      }))}
                    />
                    <select
                      value={bulkUploadMetadata[file.name]?.category_id || ''}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], category_id: e.target.value || null }
                      }))}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Equipment Type (e.g., Treadmill, Elliptical)"
                      value={bulkUploadMetadata[file.name]?.equipment_type || ''}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], equipment_type: e.target.value }
                      }))}
                    />
                    <select
                      value={bulkUploadMetadata[file.name]?.difficulty_level || 'beginner'}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], difficulty_level: e.target.value }
                      }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Estimated Time (minutes)"
                      value={bulkUploadMetadata[file.name]?.estimated_time || ''}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], estimated_time: parseInt(e.target.value) || null }
                      }))}
                    />
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={bulkUploadMetadata[file.name]?.tags?.join(', ') || ''}
                      onChange={(e) => setBulkUploadMetadata(prev => ({
                        ...prev,
                        [file.name]: { 
                          ...prev[file.name], 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                        }
                      }))}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setBulkUploadFiles(prev => prev.filter((_, i) => i !== index))
                      setBulkUploadMetadata(prev => {
                        const newMeta = { ...prev }
                        delete newMeta[file.name]
                        return newMeta
                      })
                    }}
                    className="btn btn-danger"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={bulkUploadFiles}
                disabled={uploading}
                className="btn btn-primary"
              >
                {uploading ? <Loader className="w-4 h-4 animate-spin" /> : 'Upload All Files'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Regular Upload */}
      {!showBulkUpload && (
        <div className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          className={dragActive ? 'drag-active' : ''}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Upload className="w-8 h-8" />
          <p>Drag files here or click to select</p>
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
            Select Files
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="progress-item">
              <span>{fileName}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span>{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Content Display */}
      <div className="content-area">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="categories-section">
            <h3>📁 Categories</h3>
            {categories.map(category => {
              const categoryFiles = getFilesByCategory(category.id)
              const isExpanded = expandedCategories.has(category.id)
              
              return (
                <div key={category.id} className="category">
                  <div 
                    className="category-header"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <FolderOpen className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span className="file-count">({categoryFiles.length})</span>
                  </div>
                  {isExpanded && (
                    <div className="category-files">
                      {categoryFiles.map(file => (
                        <div key={file.id} className="file-item">
                          {getFileIcon(file.file_type, file.title)}
                          <span>{file.title}</span>
                          <div className="file-actions">
                            <button onClick={() => playVideo(file)} className="btn btn-sm">
                              <Play className="w-4 h-4" />
                            </button>
                            <button onClick={() => downloadFile(file.file_path, file.title)} className="btn btn-sm">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Uncategorized Files */}
        <div className="files-section">
          <h3>📄 All Files ({filteredFiles.length})</h3>
          {loading ? (
            <div className="loading">Loading files...</div>
          ) : (
            <div className={`files-grid ${viewMode}`}>
              {filteredFiles.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-header">
                    {getFileIcon(file.file_type, file.title)}
                    <div className="file-info">
                      <h4>{file.title}</h4>
                      <p>{file.description}</p>
                      <div className="file-meta">
                        <span>{formatFileSize(file.file_size)}</span>
                        {file.equipment_type && <span className="equipment">{file.equipment_type}</span>}
                        {file.difficulty_level && <span className={`difficulty ${file.difficulty_level}`}>{file.difficulty_level}</span>}
                        {file.estimated_time && <span className="time"><Clock className="w-3 h-3" /> {file.estimated_time}m</span>}
                      </div>
                    </div>
                  </div>
                  
                  {file.tags && file.tags.length > 0 && (
                    <div className="file-tags">
                      {file.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="file-actions">
                    {file.file_type.startsWith('video/') && (
                      <button onClick={() => playVideo(file)} className="btn btn-primary">
                        <Play className="w-4 h-4" /> Play
                      </button>
                    )}
                    <button onClick={() => downloadFile(file.file_path, file.title)} className="btn btn-secondary">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteFile(file.id, file.file_path)} className="btn btn-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {currentVideo && (
        <div className="video-modal">
          <div className="video-modal-content">
            <div className="video-header">
              <h3>{currentVideo.title}</h3>
              <button onClick={() => setCurrentVideo(null)} className="btn btn-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <video
              ref={videoRef}
              controls
              className="video-player"
              src={currentVideo.url}
            >
              Your browser does not support the video tag.
            </video>
            <div className="video-info">
              <p>{currentVideo.description}</p>
              {currentVideo.equipment_type && (
                <p><strong>Equipment:</strong> {currentVideo.equipment_type}</p>
              )}
              {currentVideo.difficulty_level && (
                <p><strong>Difficulty:</strong> {currentVideo.difficulty_level}</p>
              )}
              {currentVideo.estimated_time && (
                <p><strong>Duration:</strong> {currentVideo.estimated_time} minutes</p>
              )}
              {currentVideo.required_tools && currentVideo.required_tools.length > 0 && (
                <div>
                  <strong>Required Tools:</strong>
                  <div className="tools-list">
                    {currentVideo.required_tools.map((tool, index) => (
                      <span key={index} className="tool">{tool}</span>
                    ))}
                  </div>
                </div>
              )}
              {currentVideo.safety_notes && (
                <div className="safety-notes">
                  <Shield className="w-4 h-4" />
                  <strong>Safety Notes:</strong> {currentVideo.safety_notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .knowledge-manager {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .search-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex: 1;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.5rem;
          flex: 1;
        }

        .search-box input {
          border: none;
          outline: none;
          margin-left: 0.5rem;
          width: 100%;
        }

        .view-controls {
          display: flex;
          gap: 0.5rem;
        }

        .upload-area {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .upload-area.drag-active {
          border-color: var(--primary-color);
          background-color: rgba(0, 123, 255, 0.1);
        }

        .bulk-upload-panel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .bulk-files-list {
          margin-top: 1rem;
        }

        .bulk-file-item {
          display: flex;
          align-items: start;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .file-metadata {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 2;
        }

        .file-metadata input,
        .file-metadata textarea,
        .file-metadata select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .upload-progress {
          margin-bottom: 1rem;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }

        .content-area {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
        }

        .categories-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
        }

        .category {
          margin-bottom: 1rem;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .category-header:hover {
          background-color: #f8f9fa;
        }

        .file-count {
          color: #666;
          font-size: 0.9rem;
        }

        .category-files {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
        }

        .files-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
        }

        .files-grid {
          display: grid;
          gap: 1rem;
        }

        .files-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .files-grid.list {
          grid-template-columns: 1fr;
        }

        .file-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .file-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .file-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .file-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .file-info p {
          margin: 0 0 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .file-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .file-meta span {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: #f8f9fa;
        }

        .equipment {
          background: #e3f2fd !important;
          color: #1976d2;
        }

        .difficulty {
          font-weight: bold;
        }

        .difficulty.beginner {
          background: #e8f5e8 !important;
          color: #2e7d32;
        }

        .difficulty.intermediate {
          background: #fff3e0 !important;
          color: #f57c00;
        }

        .difficulty.advanced {
          background: #ffebee !important;
          color: #c62828;
        }

        .time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .file-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
        }

        .video-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .video-modal-content {
          background: white;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .video-player {
          width: 100%;
          max-height: 60vh;
        }

        .video-info {
          padding: 1rem;
        }

        .tools-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .tool {
          background: #f8f9fa;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .safety-notes {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff3cd;
          color: #856404;
          padding: 0.5rem;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }

        .message {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .content-area {
            grid-template-columns: 1fr;
          }
          
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default KnowledgeManager