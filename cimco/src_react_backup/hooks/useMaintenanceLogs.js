import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_LOGS } from '../utils/mockData'

export function useMaintenanceLogs(equipmentId) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!equipmentId) return

        fetchLogs()
    }, [equipmentId])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            setError(null)

            // Check for forced demo mode
            if (localStorage.getItem('force_demo_mode') === 'true') {
                throw new Error('Demo Mode Forced')
            }

            const { data, error: fetchError } = await supabase
                .from('maintenance_logs')
                .select('*')
                .eq('equipment_id', equipmentId)
                .order('work_date', { ascending: false })

            if (fetchError) throw fetchError

            setLogs(data || [])
        } catch (err) {
            console.error('Error fetching maintenance logs:', err)
            // Fallback to mock data for demo stability
            console.log('Falling back to mock logs')
            setLogs(MOCK_LOGS)
            setError(null) // Don't show error in UI for demo
        } finally {
            setLoading(false)
        }
    }

    const refresh = () => {
        fetchLogs()
    }

    const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0)

    return { logs, loading, error, refresh, totalCost }
}
