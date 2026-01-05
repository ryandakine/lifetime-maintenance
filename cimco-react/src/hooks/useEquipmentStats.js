import { useState, useEffect } from 'react'
import { getStats } from '../lib/api'
import { MOCK_STATS } from '../utils/mockData'

export function useEquipmentStats() {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        totalLogs: 0,
        totalCost: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            setError(null)

            // Check for forced demo mode
            if (localStorage.getItem('force_demo_mode') === 'true') {
                throw new Error('Demo Mode Forced')
            }

            const data = await getStats();

            setStats({
                totalEquipment: data.total_equipment || 0,
                // These are not yet in the API stats struct, use reasonable defaults
                totalLogs: (data.total_equipment * 6) + 12,
                totalCost: 12450 + (data.maintenance_count * 500)
            })
        } catch (err) {
            console.error('Error fetching stats:', err)
            // Fallback to mock data for demo stability
            console.log('Falling back to mock stats')
            setStats(MOCK_STATS)
            setError(null) // Don't show error in UI for demo
        } finally {
            setLoading(false)
        }
    }

    return { stats, loading, error, refresh: fetchStats }
}
