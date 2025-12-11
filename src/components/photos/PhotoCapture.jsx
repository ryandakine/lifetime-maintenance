/**
 * Photo Capture Component
 * Handles camera access and photo capture functionality
 * Extracted from monolithic Photos.jsx
 */

import React, { useState } from 'react'
import { Camera, Upload, RotateCcw, X } from 'lucide-react'
import { useCamera } from '../../hooks/useCamera'

export default function PhotoCapture({ onPhotoCapture, onCancel }) {
    const [uploadMode, setUploadMode] = useState('camera') // 'camera' or 'file'

    const camera = useCamera((capturedFile) => {
        onPhotoCapture(capturedFile, 'camera')
    })

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            onPhotoCapture(file, 'file')
        }
    }

    const handleStartCamera = async () => {
        const success = await camera.startCamera()
        if (!success) {
            // Fallback to file upload
            setUploadMode('file')
        }
    }

    return (
        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
            <h3>Capture Photo</h3>

            {/* Mode Selection */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    onClick={() => setUploadMode('camera')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: uploadMode === 'camera' ? '#3b82f6' : '#e5e7eb',
                        color: uploadMode === 'camera' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    <Camera size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Camera
                </button>
                <button
                    onClick={() => setUploadMode('file')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: uploadMode === 'file' ? '#3b82f6' : '#e5e7eb',
                        color: uploadMode === 'file' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    <Upload size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Upload
                </button>
            </div>

            {/* Camera Mode */}
            {uploadMode === 'camera' && (
                <div>
                    {!camera.isActive ? (
                        <button
                            onClick={handleStartCamera}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <Camera size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Start Camera
                        </button>
                    ) : (
                        <div>
                            <video
                                ref={camera.videoRef}
                                autoPlay
                                playsInline
                                style={{ width: '100%', maxWidth: '500px', borderRadius: '8px', marginBottom: '1rem' }}
                            />
                            <canvas ref={camera.canvasRef} style={{ display: 'none' }} />

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={camera.capturePhoto}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Camera size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                    Capture
                                </button>
                                <button
                                    onClick={camera.stopCamera}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                    Stop
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* File Upload Mode */}
            {uploadMode === 'file' && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{
                            padding: '0.5rem',
                            border: '2px dashed #d1d5db',
                            borderRadius: '4px',
                            width: '100%'
                        }}
                    />
                </div>
            )}

            {/* Cancel Button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
            )}
        </div>
    )
}
