import React, { useState, useRef, useEffect } from 'react';
import './PhotoCapture.css';

const PhotoCapture = ({ onPhotoCaptured, onClose }) => {
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera stream
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      const photoFile = new File([blob], `maintenance_photo_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      
      setPhoto({
        file: photoFile,
        preview: URL.createObjectURL(blob),
        timestamp: new Date().toISOString()
      });
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

  const retakePhoto = () => {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhoto(null);
    setError(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const photoFile = new File([file], file.name, { type: file.type });
      setPhoto({
        file: photoFile,
        preview: URL.createObjectURL(file),
        timestamp: new Date().toISOString()
      });
      setError(null);
    } else {
      setError('Please select a valid image file.');
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('photo', photo.file);
      formData.append('timestamp', photo.timestamp);
      formData.append('description', 'Maintenance photo captured');

      const response = await fetch('http://localhost:3001/api/photos/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Trigger AI analysis
      if (result.success && result.data.id) {
        await triggerAIAnalysis(result.data.id);
      }

      onPhotoCaptured(result.data);
      setUploadProgress(100);
      
      // Clean up
      setTimeout(() => {
        if (photo?.preview) {
          URL.revokeObjectURL(photo.preview);
        }
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerAIAnalysis = async (photoId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('AI Analysis triggered:', result);
      }
    } catch (err) {
      console.error('AI Analysis error:', err);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    onClose();
  };

  return (
    <div className="photo-capture-overlay">
      <div className="photo-capture-modal">
        <div className="photo-capture-header">
          <h2>📸 Capture Maintenance Photo</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="photo-capture-content">
          {!photo ? (
            // Camera view
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="camera-controls">
                <button
                  className="capture-btn"
                  onClick={capturePhoto}
                  disabled={isCapturing || !stream}
                >
                  {isCapturing ? '📸 Capturing...' : '📸 Capture Photo'}
                </button>
                
                <button
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Upload Photo
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            // Photo preview
            <div className="photo-preview-container">
              <img
                src={photo.preview}
                alt="Captured photo"
                className="photo-preview"
              />
              
              <div className="photo-info">
                <p>📅 {new Date(photo.timestamp).toLocaleString()}</p>
                <p>📏 {photo.file.size} bytes</p>
              </div>

              <div className="photo-actions">
                {isUploading ? (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    <button
                      className="retake-btn"
                      onClick={retakePhoto}
                    >
                      🔄 Retake
                    </button>
                    
                    <button
                      className="upload-btn"
                      onClick={uploadPhoto}
                    >
                      ☁️ Upload & Analyze
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="photo-capture-footer">
          <p>💡 Tip: Take clear photos of equipment issues for better AI analysis</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture; 