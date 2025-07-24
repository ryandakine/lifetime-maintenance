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
  MoreVertical
} from 'lucide-react'

const FileUploader = () => {
  console.log('FileUploader rendering!')
  
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [uploadProgress, setUploadProgress] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFiles, setFilteredFiles] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

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

  // Load files on component mount
  useEffect(() => {
    loadFiles()
  }, [])

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files)
    } else {
      const filtered = files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFiles(filtered)
    }
  }, [searchQuery, files])

  const loadFiles = async () => {
    console.log('🔄 Loading files from Supabase Storage...')
    try {
      setLoading(true)
      const { data, error } = await supabase.storage
        .from('work-files')
        .list('', {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error('❌ Error loading files:', error)
        throw error
      }

      console.log('✅ Files loaded successfully:', data?.length || 0, 'files')
      setFiles(data || [])
      setFilteredFiles(data || [])
      
    } catch (error) {
      console.error('❌ Error loading files:', error)
      if (!isOnline) {
        showMessage('error', 'You are offline. Files cannot be loaded.')
      } else {
        showMessage('error', 'Failed to load files. Check your connection.')
      }
      setFiles([])
      setFilteredFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    console.log('📁 Files selected:', selectedFiles.map(f => f.name))
    uploadFiles(selectedFiles)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    console.log('📁 Files dropped:', droppedFiles.map(f => f.name))
    uploadFiles(droppedFiles)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const uploadFiles = async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0) return
    
    if (!isOnline) {
      showMessage('error', 'You are offline. Cannot upload files.')
      return
    }

    console.log('⬆️ Starting file upload process...')
    setUploading(true)
    const results = []

    for (const file of filesToUpload) {
      try {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        console.log(`⬆️ Uploading: ${file.name} as ${fileName}`)
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const { data, error } = await supabase.storage
          .from('work-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error(`❌ Upload failed for ${file.name}:`, error)
          results.push({ file: file.name, success: false, error: error.message })
        } else {
          console.log(`✅ Upload successful for ${file.name}:`, data)
          results.push({ file: file.name, success: true, data })
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        
      } catch (error) {
        console.error(`❌ Upload error for ${file.name}:`, error)
        results.push({ file: file.name, success: false, error: error.message })
      }
    }

    // Show results
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    if (successful > 0 && failed === 0) {
      showMessage('success', `Successfully uploaded ${successful} file(s)`)
    } else if (successful > 0 && failed > 0) {
      showMessage('warning', `Uploaded ${successful} file(s), ${failed} failed`)
    } else {
      showMessage('error', `Failed to upload ${failed} file(s)`)
    }

    // Clear progress and reload files
    setTimeout(() => {
      setUploadProgress({})
      loadFiles()
    }, 1000)
    
    setUploading(false)
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadFile = async (fileName) => {
    console.log('⬇️ Downloading file:', fileName)
    
    if (!isOnline) {
      showMessage('error', 'You are offline. Cannot download files.')
      return
    }

    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .download(fileName)

      if (error) {
        console.error('❌ Download error:', error)
        throw error
      }

      console.log('✅ File downloaded successfully')
      
      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.replace(/^\d+-/, '') // Remove timestamp prefix
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showMessage('success', 'File downloaded successfully')
    } catch (error) {
      console.error('❌ Error downloading file:', error)
      showMessage('error', 'Failed to download file')
    }
  }

  const deleteFile = async (fileName) => {
    console.log('🗑️ Deleting file:', fileName)
    
    if (!isOnline) {
      showMessage('error', 'You are offline. Cannot delete files.')
      return
    }

    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return
    }

    try {
      const { error } = await supabase.storage
        .from('work-files')
        .remove([fileName])

      if (error) {
        console.error('❌ Delete error:', error)
        throw error
      }

      console.log('✅ File deleted successfully')
      setFiles(files.filter(file => file.name !== fileName))
      setFilteredFiles(filteredFiles.filter(file => file.name !== fileName))
      showMessage('success', 'File deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting file:', error)
      showMessage('error', 'Failed to delete file')
    }
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image size={20} style={{ color: '#007BFF' }} />
      case 'pdf':
        return <FileText size={20} style={{ color: '#dc3545' }} />
      case 'doc':
      case 'docx':
        return <FileText size={20} style={{ color: '#0066cc' }} />
      case 'xls':
      case 'xlsx':
        return <FileText size={20} style={{ color: '#28a745' }} />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo size={20} style={{ color: '#6f42c1' }} />
      case 'mp3':
      case 'wav':
        return <Music size={20} style={{ color: '#fd7e14' }} />
      case 'zip':
      case 'rar':
        return <Archive size={20} style={{ color: '#6c757d' }} />
      default:
        return <File size={20} style={{ color: '#007BFF' }} />
    }
  }

  const formatFileSize = (size) => {
    if (!size) return 'Unknown size'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const copyFileLink = async (fileName) => {
    try {
      const { data } = await supabase.storage
        .from('work-files')
        .getPublicUrl(fileName)
      
      await navigator.clipboard.writeText(data.publicUrl)
      showMessage('success', 'File link copied to clipboard')
    } catch (error) {
      console.error('❌ Error copying link:', error)
      showMessage('error', 'Failed to copy file link')
    }
  }

  const showMessage = (type, text) => {
    console.log(`📢 Message: ${type} - ${text}`)
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {!isOnline && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #ffeeba',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CloudOff size={20} />
          ⚠️ You are currently offline. File operations may not work properly.
        </div>
      )}

      {message.text && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#d4edda' : 
                          message.type === 'warning' ? '#fff3cd' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : 
                 message.type === 'warning' ? '#856404' : '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : 
                               message.type === 'warning' ? '#ffeeba' : '#f5c6cb'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> :
           message.type === 'warning' ? <AlertCircle size={20} /> :
           <XCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,123,255,0.1)'
      }}>
        <h2 style={{ 
          color: '#007BFF', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Cloud size={24} />
          Upload Work Files
        </h2>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#007BFF' : '#dee2e6'}`,
            borderRadius: '8px',
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: dragActive ? '#f8f9ff' : '#f8f9fa',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading || !isOnline}
            id="file-upload"
            name="file-upload"
            aria-label="Choose file to upload"
          />
          
          {uploading ? (
            <div>
              <Loader size={48} style={{ 
                color: '#007BFF', 
                marginBottom: '1rem',
                animation: 'spin 1s linear infinite'
              }} />
              <h3 style={{ color: '#007BFF', marginBottom: '0.5rem' }}>Uploading Files...</h3>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                Please wait while your files are being uploaded
              </div>
            </div>
          ) : (
            <div>
              <Upload size={48} style={{ color: '#007BFF', marginBottom: '1rem' }} />
              <h3 style={{ color: '#007BFF', marginBottom: '0.5rem' }}>
                Drop files here or click to browse
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0 }}>
                Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, MP4, ZIP and more
              </p>
              {!isOnline && (
                <p style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '0.5rem' }}>
                  Upload requires internet connection
                </p>
              )}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} style={{ marginBottom: '0.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.9rem',
                  marginBottom: '0.25rem'
                }}>
                  <span>{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#007BFF',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,123,255,0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ 
            color: '#007BFF', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <File size={24} />
            Work Files ({filteredFiles.length})
          </h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: viewMode === 'list' ? '#007BFF' : '#f8f9fa',
                color: viewMode === 'list' ? 'white' : '#6c757d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: viewMode === 'grid' ? '#007BFF' : '#f8f9fa',
                color: viewMode === 'grid' ? 'white' : '#6c757d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={loadFiles}
              disabled={loading}
              style={{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                color: '#6c757d',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RefreshCw size={16} style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none' 
              }} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007BFF'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              id="search-input"
              name="search-input"
              aria-label="Search files"
            />
            <Search size={16} style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6c757d'
            }} />
          </div>
        </div>

        {/* File List/Grid */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6c757d' 
          }}>
            <Loader size={32} style={{ 
              marginBottom: '1rem',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Loading files...</div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6c757d' 
          }}>
            {searchQuery ? (
              <>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <div>No files match your search</div>
              </>
            ) : (
              <>
                <File size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <div>No files uploaded yet</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Upload your first work file above
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
            gap: '1rem'
          }}>
            {filteredFiles.map((file) => (
              <div
                key={file.name}
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007BFF'
                  e.currentTarget.style.backgroundColor = '#f8f9ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e9ecef'
                  e.currentTarget.style.backgroundColor = '#fafafa'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                    {getFileIcon(file.name)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#212529',
                        marginBottom: '0.25rem',
                        wordBreak: 'break-word'
                      }}>
                        {file.name.replace(/^\d+-/, '')}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#6c757d',
                        marginBottom: '0.25rem'
                      }}>
                        {formatFileSize(file.metadata?.size)}
                      </div>
                      {file.updated_at && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#6c757d'
                        }}>
                          {new Date(file.updated_at).toLocaleDateString()} {new Date(file.updated_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button
                      onClick={() => downloadFile(file.name)}
                      disabled={!isOnline}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: isOnline ? '#007BFF' : '#6c757d',
                        color: 'white',
                        cursor: isOnline ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                      title="Download file"
                      aria-label="Download file"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => copyFileLink(file.name)}
                      disabled={!isOnline}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: isOnline ? '#28a745' : '#6c757d',
                        color: 'white',
                        cursor: isOnline ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                      title="Copy file link"
                      aria-label="Copy file link"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => deleteFile(file.name)}
                      disabled={!isOnline}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: isOnline ? '#dc3545' : '#6c757d',
                        color: 'white',
                        cursor: isOnline ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                      title="Delete file"
                      aria-label="Delete file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default FileUploader