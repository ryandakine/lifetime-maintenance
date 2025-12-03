import React from 'react'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useAchievements } from '../../hooks/useAchievements'
import LoadingSpinner from '../common/LoadingSpinner'

export default function UserProfile({ userId = 'demo_user' }) {
    const { profile, loading } = useUserProfile(userId)
    const { achievements, userAchievements } = useAchievements(userId)

    if (loading) {
        return <LoadingSpinner message="Loading profile..." />
    }

    if (!profile) {
        return (
            <div className="empty-state">
                <p>Profile not found</p>
            </div>
        )
    }

    const levelProgress = calculateLevelProgress(profile.points, profile.level)
    const earnedAchievements = achievements.filter(a =>
        userAchievements.find(ua => ua.achievement_id === a.achievement_id)
    )

    return (
        <div className="user-profile" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Profile Header */}
            <div className="profile-header" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px'
                    }}>
                        👤
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{profile.display_name || profile.username}</h2>
                        <div style={{ fontSize: '16px', opacity: 0.9 }}>
                            Level {profile.level} • {profile.location_id.charAt(0).toUpperCase() + profile.location_id.slice(1)}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{profile.points}</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Points</div>
                    </div>
                </div>

                {/* Level Progress Bar */}
                <div style={{ marginTop: '20px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '8px'
                    }}>
                        <span>Level {profile.level}</span>
                        <span>{levelProgress.current} / {levelProgress.required} XP</span>
                        <span>Level {profile.level + 1}</span>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        height: '8px',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'white',
                            height: '100%',
                            width: `${levelProgress.percentage}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <StatCard icon="🔥" label="Current Streak" value={`${profile.current_streak} days`} />
                <StatCard icon="📝" label="Total Logs" value={profile.total_logs} />
                <StatCard icon="📱" label="Total Scans" value={profile.total_scans} />
                <StatCard icon="📸" label="Photos" value={profile.total_photos} />
                <StatCard icon="🎤" label="Voice Entries" value={profile.total_voice_entries} />
                <StatCard icon="🏆" label="Best Streak" value={`${profile.longest_streak} days`} />
            </div>

            {/* Achievements */}
            <div className="achievements-section" style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Achievements ({earnedAchievements.length} / {achievements.length})</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '12px'
                }}>
                    {achievements.map(achievement => {
                        const earned = earnedAchievements.find(a => a.achievement_id === achievement.achievement_id)
                        return (
                            <AchievementBadge
                                key={achievement.achievement_id}
                                achievement={achievement}
                                earned={!!earned}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }) {
    return (
        <div style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{label}</div>
        </div>
    )
}

function AchievementBadge({ achievement, earned }) {
    return (
        <div style={{
            background: earned ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
            color: earned ? 'white' : '#999',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            opacity: earned ? 1 : 0.6,
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title={achievement.description}
        >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{achievement.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{achievement.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>+{achievement.points} pts</div>
        </div>
    )
}

function calculateLevelProgress(points, level) {
    const levelThresholds = [0, 100, 250, 500, 1000]

    let currentThreshold = 0
    let nextThreshold = 100

    if (level <= 4) {
        currentThreshold = levelThresholds[level - 1]
        nextThreshold = levelThresholds[level]
    } else {
        currentThreshold = 1000 + ((level - 5) * 500)
        nextThreshold = currentThreshold + 500
    }

    const current = points - currentThreshold
    const required = nextThreshold - currentThreshold
    const percentage = (current / required) * 100

    return { current, required, percentage: Math.min(percentage, 100) }
}
