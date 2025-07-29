import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'react-camera-pro';
import { fabric } from 'fabric';
import './MobilePhotoCapture.css';

const MobilePhotoCapture = ({ onPhotoCapture, onAnnotationComplete }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationMode, setAnnotationMode] = useState('draw'); // draw, text, arrow, shape
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Initialize Fabric.js canvas for annotations
  useEffect(() => {
    if (capturedImage && isAnnotating) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 300,
        backgroundColor: 'transparent'
      });

      // Load captured image as background
      fabric.Image.fromURL(capturedImage, (img) => {
        img.scaleToWidth(400);
        fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
      });

      return () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }
      };
    }
  }, [capturedImage, isAnnotating]);

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const image = cameraRef.current.takePhoto();
        setCapturedImage(image);
        setIsCapturing(false);
      } catch (error) {
        console.error('Photo capture failed:', error);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsAnnotating(false);
    setIsCapturing(true);
  };

  const startAnnotation = () => {
    setIsAnnotating(true);
  };

  const addAnnotation = () => {
    if (!fabricCanvasRef.current) return;

    switch (annotationMode) {
      case 'draw':
        fabricCanvasRef.current.isDrawingMode = true;
        fabricCanvasRef.current.freeDrawingBrush.width = 3;
        fabricCanvasRef.current.freeDrawingBrush.color = '#ff0000';
        break;
      
      case 'text':
        const text = new fabric.IText('Add text here', {
          left: 100,
          top: 100,
          fontSize: 16,
          fill: '#ff0000',
          fontFamily: 'Arial'
        });
        fabricCanvasRef.current.add(text);
        fabricCanvasRef.current.setActiveObject(text);
        break;
      
      case 'arrow':
        const arrow = new fabric.Path('M 0 0 L 50 0 L 45 -5 M 50 0 L 45 5', {
          left: 100,
          top: 100,
          stroke: '#ff0000',
          strokeWidth: 3,
          fill: 'transparent'
        });
        fabricCanvasRef.current.add(arrow);
        break;
      
      case 'shape':
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          width: 80,
          height: 60,
          stroke: '#ff0000',
          strokeWidth: 2,
          fill: 'transparent'
        });
        fabricCanvasRef.current.add(rect);
        break;
    }
  };

  const clearAnnotations = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      // Restore background image
      if (capturedImage) {
        fabric.Image.fromURL(capturedImage, (img) => {
          img.scaleToWidth(400);
          fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
        });
      }
    }
  };

  const saveAnnotatedPhoto = () => {
    if (fabricCanvasRef.current) {
      const annotatedImage = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 0.8
      });
      
      const photoData = {
        image: annotatedImage,
        timestamp: new Date().toISOString(),
        location,
        annotations: fabricCanvasRef.current.getObjects().map(obj => ({
          type: obj.type,
          left: obj.left,
          top: obj.top,
          properties: obj.toObject()
        })),
        metadata: {
          originalImage: capturedImage,
          annotationMode,
          deviceInfo: {
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            isOnline
          }
        }
      };

      if (isOnline) {
        onPhotoCapture(photoData);
      } else {
        // Add to offline queue
        setOfflineQueue(prev => [...prev, photoData]);
        alert('Photo saved to offline queue. Will sync when online.');
      }

      setIsAnnotating(false);
      setCapturedImage(null);
      setIsCapturing(true);
    }
  };

  const selectFromGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length > 0 && isOnline) {
      try {
        for (const photoData of offlineQueue) {
          await onPhotoCapture(photoData);
        }
        setOfflineQueue([]);
        alert('Offline photos synced successfully!');
      } catch (error) {
        console.error('Sync failed:', error);
        alert('Failed to sync offline photos. Please try again.');
      }
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline]);

  if (isCapturing) {
    return (
      <div className="mobile-capture-container">
        <div className="camera-header">
          <h3>📸 Photo Capture</h3>
          {!isOnline && <span className="offline-badge">Offline</span>}
        </div>
        
        <div className="camera-view">
          <Camera
            ref={cameraRef}
            aspectRatio={4/3}
            facingMode="environment"
          />
        </div>
        
        <div className="capture-controls">
          <button onClick={selectFromGallery} className="btn-secondary">
            📁 Gallery
          </button>
          <button onClick={capturePhoto} className="btn-capture">
            📷 Capture
          </button>
          <button onClick={() => setIsCapturing(false)} className="btn-secondary">
            ❌ Cancel
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  if (capturedImage && !isAnnotating) {
    return (
      <div className="mobile-capture-container">
        <div className="photo-preview">
          <img src={capturedImage} alt="Captured" />
        </div>
        
        <div className="preview-controls">
          <button onClick={retakePhoto} className="btn-secondary">
            🔄 Retake
          </button>
          <button onClick={startAnnotation} className="btn-primary">
            ✏️ Annotate
          </button>
          <button 
            onClick={() => onPhotoCapture({
              image: capturedImage,
              timestamp: new Date().toISOString(),
              location,
              metadata: { deviceInfo: { userAgent: navigator.userAgent } }
            })} 
            className="btn-success"
          >
            💾 Save
          </button>
        </div>
      </div>
    );
  }

  if (isAnnotating) {
    return (
      <div className="mobile-capture-container">
        <div className="annotation-header">
          <h3>✏️ Photo Annotation</h3>
          <button onClick={() => setIsAnnotating(false)} className="btn-close">
            ❌
          </button>
        </div>
        
        <div className="annotation-tools">
          <button 
            onClick={() => setAnnotationMode('draw')}
            className={annotationMode === 'draw' ? 'btn-active' : 'btn-tool'}
          >
            ✏️ Draw
          </button>
          <button 
            onClick={() => setAnnotationMode('text')}
            className={annotationMode === 'text' ? 'btn-active' : 'btn-tool'}
          >
            📝 Text
          </button>
          <button 
            onClick={() => setAnnotationMode('arrow')}
            className={annotationMode === 'arrow' ? 'btn-active' : 'btn-tool'}
          >
            ➡️ Arrow
          </button>
          <button 
            onClick={() => setAnnotationMode('shape')}
            className={annotationMode === 'shape' ? 'btn-active' : 'btn-tool'}
          >
            ⬜ Shape
          </button>
        </div>
        
        <div className="annotation-canvas">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="annotation-controls">
          <button onClick={addAnnotation} className="btn-tool">
            ➕ Add {annotationMode}
          </button>
          <button onClick={clearAnnotations} className="btn-secondary">
            🗑️ Clear
          </button>
          <button onClick={saveAnnotatedPhoto} className="btn-success">
            💾 Save Annotated
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-capture-container">
      <div className="capture-header">
        <h3>📱 Mobile Photo Capture</h3>
        {!isOnline && <span className="offline-badge">Offline Mode</span>}
        {offlineQueue.length > 0 && (
          <span className="queue-badge">{offlineQueue.length} pending</span>
        )}
      </div>
      
      <div className="capture-options">
        <button onClick={() => setIsCapturing(true)} className="btn-primary">
          📷 Take Photo
        </button>
        <button onClick={selectFromGallery} className="btn-secondary">
          📁 Choose from Gallery
        </button>
        {offlineQueue.length > 0 && (
          <button onClick={syncOfflineQueue} className="btn-sync">
            🔄 Sync Offline Photos ({offlineQueue.length})
          </button>
        )}
      </div>
      
      {location && (
        <div className="location-info">
          📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MobilePhotoCapture; 