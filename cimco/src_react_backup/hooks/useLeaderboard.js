import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLeaderboard(locationId = 'sterling', limit = 10) {
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchLeaderboard()
    }, [locationId, limit])

    const fetchLeaderboard = async () => {
        try {
            setLoading(true)

            // Fetch leaderboard from view
            const { data, error: fetchError } = await supabase
                .from('leaderboard')
                .select('*')
                .eq('location_id', locationId)
                .limit(limit)

            if (fetchError) throw fetchError
            setLeaderboard(data || [])
        } catch (err) {
            console.error('Error fetching leaderboard:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getGlobalLeaderboard = async (limit = 10) => {
        try {
            const { data, error: fetchError } = await supabase
                .from('leaderboard')
                .select('*')
                .limit(limit)

            if (fetchError) throw fetchError
            return { success: true, data }
        } catch (err) {
            console.error('Error fetching global leaderboard:', err)
            return { success: false, error: err.message }
        }
    }

    return {
        leaderboard,
        loading,
        error,
        refreshLeaderboard: fetchLeaderboard,
        getGlobalLeaderboard
    }
}
