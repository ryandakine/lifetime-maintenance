import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * Custom hook for camera functionality
 * Extracted from Photos.jsx for reusability and reduced file complexity
 */
export const useCamera = (onPhotoCapture) => {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const [cameraState, setCameraState] = useState({
        isAvailable: false,
        isActive: false,
        stream: null,
        error: null
    })

    // Check camera availability on mount
    useEffect(() => {
        checkCameraAvailability()
    }, [])

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (cameraState.stream) {
                cameraState.stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [cameraState.stream])

    const checkCameraAvailability = useCallback(() => {
        const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        const cameraAvailable = hasMediaDevices && navigator.mediaDevices.enumerateDevices

        console.log('Camera access: ' + (hasMediaDevices ? 'available' : 'not available'))

        setCameraState(prev => ({
            ...prev,
            isAvailable: Boolean(cameraAvailable),
            error: !hasMediaDevices ? 'Camera not available' : null
        }))

        return Boolean(cameraAvailable)
    }, [])

    const startCamera = useCallback(async () => {
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

            setCameraState(prev => ({
                ...prev,
                isActive: true,
                stream,
                error: null
            }))

            console.log('Camera started successfully')
            return true

        } catch (error) {
            console.error('Camera access error:', error)
            setCameraState(prev => ({
                ...prev,
                isActive: false,
                error: error.message
            }))
            return false
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (cameraState.stream) {
            cameraState.stream.getTracks().forEach(track => track.stop())
        }

        setCameraState(prev => ({
            ...prev,
            isActive: false,
            stream: null
        }))
    }, [cameraState.stream])

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to blob and create file
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

                    // Stop camera after capture
                    stopCamera()

                    // Call the callback if provided
                    if (onPhotoCapture) {
                        onPhotoCapture(file)
                    }

                    resolve(file)
                } else {
                    resolve(null)
                }
            }, 'image/jpeg', 0.8)
        })
    }, [stopCamera, onPhotoCapture])

    return {
        // Refs for video and canvas elements
        videoRef,
        canvasRef,

        // State
        isAvailable: cameraState.isAvailable,
        isActive: cameraState.isActive,
        error: cameraState.error,

        // Actions
        checkCameraAvailability,
        startCamera,
        stopCamera,
        capturePhoto
    }
}

export default useCamera
