import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getBilingualText } from '../utils/translations'

export default function OperatorMode() {
    const { language } = useLanguage()
    const [isOnShift, setIsOnShift] = useState(() => {
        return localStorage.getItem('cimco_operator_on_shift') === 'true'
    })
    const [operatorName, setOperatorName] = useState(() => {
        return localStorage.getItem('cimco_operator_name') || ''
    })
    const [shiftStartTime, setShiftStartTime] = useState(() => {
        return localStorage.getItem('cimco_shift_start') || null
    })

    useEffect(() => {
        localStorage.setItem('cimco_operator_on_shift', isOnShift)
        if (operatorName) {
            localStorage.setItem('cimco_operator_name', operatorName)
        }
        if (shiftStartTime) {
            localStorage.setItem('cimco_shift_start', shiftStartTime)
        }
    }, [isOnShift, operatorName, shiftStartTime])

    const handleCheckIn = () => {
        if (!operatorName.trim()) {
            alert(getBilingualText('workerName', language) + ' required!')
            return
        }
        setIsOnShift(true)
        setShiftStartTime(new Date().toISOString())
    }

    const handleCheckOut = () => {
        setIsOnShift(false)
        setShiftStartTime(null)
    }

    const getShiftDuration = () => {
        if (!shiftStartTime) return '0h 0m'
        const start = new Date(shiftStartTime)
        const now = new Date()
        const diffMs = now - start
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m`
    }

    return (
        <div style={{
            background: isOnShift ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' : '#f5f5f5',
            color: isOnShift ? 'white' : '#333',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                <div style={{ fontSize: '28px' }}>{isOnShift ? '✅' : '⏸️'}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {getBilingualText('operatorMode', language)}
                    </div>
                    {isOnShift && (
                        <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
                            {operatorName} • {getShiftDuration()}
                        </div>
                    )}
                </div>
                <div style={{
                    background: isOnShift ? 'rgba(255,255,255,0.2)' : '#3498db',
                    color: isOnShift ? 'white' : 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {getBilingualText(isOnShift ? 'onShift' : 'offShift', language)}
                </div>
            </div>

            {!isOnShift && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            {/* Hint for Dad */}
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Select a name to start shift:</div>
                            <select
                                value={operatorName}
                                onChange={(e) => setOperatorName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    appearance: 'none', // Remove default arrow
                                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right .7em top 50%',
                                    backgroundSize: '.65em auto',
                                    paddingRight: '1.5em'
                                }}
                            >
                                <option value="" disabled>Select Operator...</option>
                                <option value="Ryan Dakin">Ryan Dakin</option>
                                <option value="Mike Johnson">Mike Johnson</option>
                                <option value="Sarah Connor">Sarah Connor</option>
                                <option value="John Smith">John Smith</option>
                                <option value="David Miller">David Miller</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCheckIn}
                            style={{
                                padding: '10px 20px',
                                background: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            {getBilingualText('checkIn', language)}
                        </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        Recent: <span style={{ color: '#2980b9', cursor: 'pointer' }} onClick={() => setOperatorName('Ryan Dakin')}>Ryan</span>,{' '}
                        <span style={{ color: '#2980b9', cursor: 'pointer' }} onClick={() => setOperatorName('Mike Johnson')}>Mike</span>
                    </div>
                </div>
            )}

            {isOnShift && (
                <button
                    onClick={handleCheckOut}
                    style={{
                        padding: '10px 20px',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        width: '100%'
                    }}
                >
                    {getBilingualText('checkOut', language)}
                </button>
            )}
        </div>
    )
}
