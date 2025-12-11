/**
 * Photo Analysis Component
 * Displays AI analysis results for photos
 * Extracted from monolithic Photos.jsx
 */

import React from 'react'
import { Brain, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'

export default function PhotoAnalysis({ analysis, purpose, loading }) {
    if (loading) {
        return (
            <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                <Brain className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>Analyzing photo...</p>
            </div>
        )
    }

    if (!analysis) {
        return null
    }

    const getPurposeIcon = () => {
        switch (purpose) {
            case 'clarification':
                return <HelpCircle size={20} />
            case 'verify_done':
                return <CheckCircle size={20} />
            default:
                return <Brain size={20} />
        }
    }

    const getPurposeColor = () => {
        switch (purpose) {
            case 'clarification':
                return '#3b82f6'
            case 'verify_done':
                return '#10b981'
            case 'next_steps':
                return '#f59e0b'
            default:
                return '#8b5cf6'
        }
    }

    return (
        <div style={{
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: `2px solid ${getPurposeColor()}20`
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: getPurposeColor()
            }}>
                {getPurposeIcon()}
                <h3 style={{ margin: 0 }}>
                    AI Analysis {purpose && `- ${purpose.replace('_', ' ')}`}
                </h3>
            </div>

            <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                {analysis}
            </div>
        </div>
    )
}
