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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        placeholder={getBilingualText('workerName', language)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />
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
