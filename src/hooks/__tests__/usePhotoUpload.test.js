import { describe, test, expect } from 'vitest'
import { usePhotoUpload } from '../usePhotoUpload'
import { renderHook, act } from '@testing-library/react'

describe('usePhotoUpload Hook', () => {
    test('initializes with default state', () => {
        const { result } = renderHook(() => usePhotoUpload())

        expect(result.current.uploading).toBe(false)
        expect(result.current.progress).toBe(0)
        expect(result.current.error).toBe(null)
    })

    test('handles file upload', async () => {
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        const { result } = renderHook(() => usePhotoUpload())

        await act(async () => {
            await result.current.uploadPhoto(mockFile)
        })

        expect(result.current.uploading).toBe(false)
    })
})
