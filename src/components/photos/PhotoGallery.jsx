/**
 * Photo Gallery Component
 * Displays photos in a grid with pagination
 * Extracted from monolithic Photos.jsx
 */

import React, { useMemo } from 'react'
import { Image, Calendar, Tag, Trash2 } from 'lucide-react'

export default function PhotoGallery({
    photos,
    loading,
    onPhotoClick,
    onPhotoDelete,
    searchQuery
}) {
    // Filter photos based on search
    const filteredPhotos = useMemo(() => {
        if (!searchQuery) return photos

        return photos.filter(photo =>
            photo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            photo.ai_analysis?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [photos, searchQuery])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner">Loading photos...</div>
            </div>
        )
    }

    if (filteredPhotos.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <Image size={48} style={{ margin: '0 auto 1rem' }} />
                <p>No photos found</p>
            </div>
        )
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            padding: '1rem 0'
        }}>
            {filteredPhotos.map(photo => (
                <div
                    key={photo.id}
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                    onClick={() => onPhotoClick(photo)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <img
                        src={photo.photo_url}
                        alt={photo.description || 'Equipment photo'}
                        style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover'
                        }}
                        loading="lazy"
                    />

                    <div style={{ padding: '0.75rem' }}>
                        {photo.purpose && (
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                marginBottom: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <Tag size={12} />
                                {photo.purpose}
                            </div>
                        )}

                        {photo.description && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#374151',
                                marginBottom: '0.5rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {photo.description}
                            </p>
                        )}

                        <div style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <Calendar size={12} />
                            {new Date(photo.created_at).toLocaleDateString()}
                        </div>

                        {onPhotoDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onPhotoDelete(photo.id)
                                }}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <Trash2 size={12} />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
