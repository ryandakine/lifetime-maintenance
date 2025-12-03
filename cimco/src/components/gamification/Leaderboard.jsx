import React from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import LoadingSpinner from '../common/LoadingSpinner'

export default function Leaderboard({ locationId = 'sterling', showGlobal = false }) {
    const { leaderboard, loading } = useLeaderboard(locationId, 10)

    if (loading) {
        return <LoadingSpinner message="Loading leaderboard..." />
    }

    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇'
            case 2: return '🥈'
            case 3: return '🥉'
            default: return `${rank}️⃣`
        }
    }

    return (
        <div className="leaderboard" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: '0 0 8px 0' }}>📊 {showGlobal ? 'Global' : 'Sterling'} Leaderboard</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Top performers this month</p>
            </div>

            {leaderboard.length === 0 ? (
                <div className="empty-state">
                    <p>No rankings yet</p>
                </div>
            ) : (
                <div className="leaderboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leaderboard.map((player, index) => (
                        <LeaderboardRow
                            key={player.user_id}
                            rank={player.location_rank || index + 1}
                            player={player}
                        />
                    ))}
                </div>
            )}

            {/* Multi-Location Teaser */}
            {!showGlobal && (
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    border: '2px dashed #ddd'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>🌎 Multi-Location Coming Soon</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                        Imagine competing with Denver, Phoenix, and other locations!
                        Global rankings, regional tournaments, and team competitions.
                    </p>
                </div>
            )}
        </div>
    )
}

function LeaderboardRow({ rank, player }) {
    const getMedalIcon = (r) => {
        switch (r) {
            case 1: return '🥇'
            case 2: return '🥈'
            case 3: return '🥉'
            default: return r
        }
    }

    const isTopThree = rank <= 3

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '15px',
            background: isTopThree ? 'linear-gradient(90deg, #fff9e6, white)' : 'white',
            border: isTopThree ? '2px solid #ffd700' : '1px solid #e0e0e0',
            borderRadius: '8px',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
        >
            <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                minWidth: '40px',
                textAlign: 'center'
            }}>
                {getMedalIcon(rank)}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                    {player.display_name || player.username}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Level {player.level} • {player.current_streak} day streak 🔥
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                    {player.points}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>points</div>
            </div>
        </div>
    )
}
