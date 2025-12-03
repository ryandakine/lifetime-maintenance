import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserProfile(userId = 'demo_user') {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchProfile()
    }, [userId])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data, error: fetchError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('username', userId)
                .single()

            if (fetchError) throw fetchError
            setProfile(data)
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addPoints = async (points, activityType = 'manual') => {
        try {
            // Add points to profile
            const newPoints = (profile?.points || 0) + points
            const newLevel = calculateLevel(newPoints)

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    points: newPoints,
                    level: newLevel
                })
                .eq('username', userId)

            if (updateError) throw updateError

            // Log activity
            await supabase
                .from('activity_log')
                .insert({
                    user_id: profile?.user_id,
                    activity_type: activityType,
                    points_earned: points
                })

            // Refresh profile
            await fetchProfile()
            return { success: true, newPoints, newLevel }
        } catch (err) {
            console.error('Error adding points:', err)
            return { success: false, error: err.message }
        }
    }

    const updateStreak = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const lastActivity = profile?.last_activity_date

            let newStreak = 1

            if (lastActivity) {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayStr = yesterday.toISOString().split('T')[0]

                if (lastActivity === yesterdayStr) {
                    // Continuing streak
                    newStreak = (profile?.current_streak || 0) + 1
                } else if (lastActivity === today) {
                    // Already logged today
                    return { success: true, streak: profile?.current_streak }
                }
            }

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, profile?.longest_streak || 0),
                    last_activity_date: today
                })
                .eq('username', userId)

            if (updateError) throw updateError

            await fetchProfile()
            return { success: true, streak: newStreak }
        } catch (err) {
            console.error('Error updating streak:', err)
            return { success: false, error: err.message }
        }
    }

    const incrementStat = async (statName) => {
        try {
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    [statName]: (profile?.[statName] || 0) + 1
                })
                .eq('username', userId)

            if (updateError) throw updateError
            await fetchProfile()
            return { success: true }
        } catch (err) {
            console.error('Error incrementing stat:', err)
            return { success: false, error: err.message }
        }
    }

    return {
        profile,
        loading,
        error,
        addPoints,
        updateStreak,
        incrementStat,
        refreshProfile: fetchProfile
    }
}

// Helper function to calculate level from points
function calculateLevel(points) {
    if (points < 100) return 1
    if (points < 250) return 2
    if (points < 500) return 3
    if (points < 1000) return 4
    return Math.floor((points - 1000) / 500) + 5
}
