import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAchievements(userId = 'demo_user') {
    const [achievements, setAchievements] = useState([])
    const [userAchievements, setUserAchievements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAchievements()
    }, [userId])

    const fetchAchievements = async () => {
        try {
            setLoading(true)

            // Fetch all achievements
            const { data: allAchievements, error: achieveError } = await supabase
                .from('achievements')
                .select('*')
                .order('points', { ascending: true })

            if (achieveError) throw achieveError

            // Fetch user's achievements
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('username', userId)
                .single()

            if (profile) {
                const { data: userAchieve, error: userError } = await supabase
                    .from(' user_achievements')
                    .select('achievement_id, earned_at')
                    .eq('user_id', profile.user_id)

                if (!userError) {
                    setUserAchievements(userAchieve || [])
                }
            }

            setAchievements(allAchievements || [])
        } catch (err) {
            console.error('Error fetching achievements:', err)
        } finally {
            setLoading(false)
        }
    }

    const checkAndAwardAchievements = async (userProfile) => {
        const earned = []

        for (const achievement of achievements) {
            // Skip if already earned
            if (userAchievements.find(ua => ua.achievement_id === achievement.achievement_id)) {
                continue
            }

            let shouldAward = false

            // Check requirement
            switch (achievement.requirement_type) {
                case 'logs':
                    shouldAward = userProfile.total_logs >= achievement.requirement_value
                    break
                case 'scans':
                    shouldAward = userProfile.total_scans >= achievement.requirement_value
                    break
                case 'photos':
                    shouldAward = userProfile.total_photos >= achievement.requirement_value
                    break
                case 'voice_entries':
                    shouldAward = userProfile.total_voice_entries >= achievement.requirement_value
                    break
                case 'streak':
                    shouldAward = userProfile.current_streak >= achievement.requirement_value
                    break
                case 'level':
                    shouldAward = userProfile.level >= achievement.requirement_value
                    break
            }

            if (shouldAward) {
                earned.push(achievement)
            }
        }

        // Award achievements
        for (const achievement of earned) {
            await supabase
                .from('user_achievements')
                .insert({
                    user_id: userProfile.user_id,
                    achievement_id: achievement.achievement_id
                })
        }

        if (earned.length > 0) {
            await fetchAchievements()
        }

        return earned
    }

    return {
        achievements,
        userAchievements,
        loading,
        checkAndAwardAchievements,
        refreshAchievements: fetchAchievements
    }
}
