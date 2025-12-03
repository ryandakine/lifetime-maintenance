import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_STATS } from '../utils/mockData'

export function useEquipmentStats() {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        totalLogs: 0
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

            // Get equipment count
            const { count: equipmentCount, error: equipmentError } = await supabase
                .from('equipment')
                .select('*', { count: 'exact', head: true })

            if (equipmentError) throw equipmentError

            // Get logs count
            const { count: logsCount, error: logsError } = await supabase
                .from('maintenance_logs')
                .select('*', { count: 'exact', head: true })

            if (logsError) throw logsError

            // Calculate total cost
            const { data: costData, error: costError } = await supabase
                .from('maintenance_logs')
                .select('cost')

            const totalCost = costData?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0

            setStats({
                totalEquipment: equipmentCount || 0,
                totalLogs: logsCount || 0,
                totalCost: totalCost
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
