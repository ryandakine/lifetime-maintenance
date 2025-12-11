import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook for photo upload functionality
 * Handles online/offline upload, Supabase storage integration
 */
export const usePhotoUpload = () => {
    const [uploadState, setUploadState] = useState({
        isUploading: false,
        photoUrl: null,
        error: null,
        progress: 0
    })

    const uploadToSupabase = useCallback(async (file, bucket = 'photos', folder = 'project-photos') => {
        try {
            setUploadState(prev => ({ ...prev, isUploading: true, error: null }))

            const fileName = `${folder}/${Date.now()}_${file.name}`
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            setUploadState(prev => ({
                ...prev,
                isUploading: false,
                photoUrl: publicUrl
            }))

            return { success: true, url: publicUrl, fileName }

        } catch (error) {
            console.error('Error uploading photo:', error)
            setUploadState(prev => ({
                ...prev,
                isUploading: false,
                error: error.message
            }))
            return { success: false, error: error.message }
        }
    }, [])

    const saveOfflinePhoto = useCallback(async (file, purpose) => {
        try {
            // Convert file to base64 for localStorage
            const reader = new FileReader()

            return new Promise((resolve, reject) => {
                reader.onload = () => {
                    const offlinePhoto = {
                        id: `offline-${Date.now()}`,
                        base64: reader.result,
                        filename: file.name,
                        purpose,
                        timestamp: new Date().toISOString(),
                        synced: false
                    }

                    // Get existing offline photos
                    const existing = JSON.parse(localStorage.getItem('offlinePhotos') || '[]')
                    existing.push(offlinePhoto)
                    localStorage.setItem('offlinePhotos', JSON.stringify(existing))

                    console.log('Photo saved offline:', offlinePhoto.id)
                    resolve(offlinePhoto)
                }

                reader.onerror = reject
                reader.readAsDataURL(file)
            })
        } catch (error) {
            console.error('Error saving offline photo:', error)
            throw error
        }
    }, [])

    const loadOfflinePhotos = useCallback(() => {
        try {
            return JSON.parse(localStorage.getItem('offlinePhotos') || '[]')
        } catch {
            return []
        }
    }, [])

    const syncOfflinePhotos = useCallback(async () => {
        const offlinePhotos = loadOfflinePhotos()
        const unsynced = offlinePhotos.filter(p => !p.synced)

        console.log(`Syncing ${unsynced.length} offline photos...`)

        for (const photo of unsynced) {
            try {
                // Convert base64 back to blob
                const response = await fetch(photo.base64)
                const blob = await response.blob()
                const file = new File([blob], photo.filename, { type: 'image/jpeg' })

                const result = await uploadToSupabase(file)

                if (result.success) {
                    // Mark as synced
                    photo.synced = true
                    photo.remoteUrl = result.url
                }
            } catch (error) {
                console.error('Failed to sync photo:', photo.id, error)
            }
        }

        // Update localStorage
        localStorage.setItem('offlinePhotos', JSON.stringify(offlinePhotos))

        return offlinePhotos.filter(p => p.synced)
    }, [loadOfflinePhotos, uploadToSupabase])

    const reset = useCallback(() => {
        setUploadState({
            isUploading: false,
            photoUrl: null,
            error: null,
            progress: 0
        })
    }, [])

    return {
        // State
        isUploading: uploadState.isUploading,
        photoUrl: uploadState.photoUrl,
        error: uploadState.error,

        // Actions
        uploadToSupabase,
        saveOfflinePhoto,
        loadOfflinePhotos,
        syncOfflinePhotos,
        reset
    }
}

export default usePhotoUpload
