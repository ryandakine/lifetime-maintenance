import React from 'react'
import { getBilingualText } from '../utils/translations'

export default function AboutCimco({ onBack }) {
    return (
        <div className="about-cimco" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="about-header" style={{
                textAlign: 'center',
                marginBottom: '30px',
                background: 'linear-gradient(135deg, #1a3b5c 0%, #2c5282 100%)',
                color: 'white',
                padding: '40px 20px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <img
                    src="/cimco-logo-official.png"
                    alt="Cimco Resources"
                    style={{
                        height: '80px',
                        marginBottom: '20px',
                        filter: 'brightness(0) invert(1)' // Make logo white for dark background
                    }}
                />
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Building the Future, One Ton at a Time</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Since 1998 • Sterling, Illinois</p>
            </div>

            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <StatBox icon="🏗️" value="7" label="Locations" />
                <StatBox icon="♻️" value="500k+" label="Tons Recycled/Year" />
                <StatBox icon="🚛" value="100+" label="Fleet Vehicles" />
                <StatBox icon="👥" value="250+" label="Team Members" />
            </div>

            <div className="mission-section" style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                marginBottom: '30px',
                borderLeft: '5px solid #8cc63f'
            }}>
                <h2 style={{ color: '#1a3b5c', marginTop: 0 }}>Our Mission</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4a5568' }}>
                    At Cimco Resources, we don't just recycle metal; we forge relationships.
                    From our massive <strong>Industrial Shredder</strong> capable of processing whole cars in seconds,
                    to our state-of-the-art non-ferrous sorting lines, we are the backbone of the Midwest's recycling infrastructure.
                </p>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4a5568' }}>
                    You are part of a team that keeps millions of pounds of material out of landfills every year.
                    Your work matters.
                </p>
            </div>

            <div className="locations-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '15px'
            }}>
                <LocationCard name="Sterling (HQ)" type="Full Service" />
                <LocationCard name="Rock Falls" type="Feeder Yard" />
                <LocationCard name="Ottawa" type="Processing" />
                <LocationCard name="Moline" type="Industrial" />
                <LocationCard name="Marion" type="Collection" />
            </div>

            <button
                onClick={onBack}
                style={{
                    marginTop: '40px',
                    width: '100%',
                    padding: '15px',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                ← Back to Dashboard
            </button>
        </div>
    )
}

function StatBox({ icon, value, label }) {
    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a3b5c' }}>{value}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>{label}</div>
        </div>
    )
}

function LocationCard({ name, type }) {
    return (
        <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ fontWeight: 'bold', color: '#1a3b5c' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{type}</div>
        </div>
    )
}
