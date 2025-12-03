import { useState, useEffect } from 'react'

export function useWakeLock() {
    const [wakeLock, setWakeLock] = useState(null)
    const [isActive, setIsActive] = useState(false)

    const request = async () => {
        try {
            if ('wakeLock' in navigator) {
                const lock = await navigator.wakeLock.request('screen')
                setWakeLock(lock)
                setIsActive(true)

                lock.addEventListener('release', () => {
                    setIsActive(false)
                })

                return { success: true }
            } else {
                console.warn('Wake Lock API not supported')
                return { success: false, error: 'Not supported' }
            }
        } catch (err) {
            console.error('Failed to request wake lock:', err)
            return { success: false, error: err.message }
        }
    }

    const release = async () => {
        if (wakeLock) {
            await wakeLock.release()
            setWakeLock(null)
            setIsActive(false)
        }
    }

    useEffect(() => {
        return () => {
            if (wakeLock) {
                wakeLock.release()
            }
        }
    }, [wakeLock])

    return {
        isActive,
        request,
        release
    }
}
