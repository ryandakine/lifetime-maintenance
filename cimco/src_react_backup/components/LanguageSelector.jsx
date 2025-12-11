import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../utils/translations'

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage()

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇲🇽' },
        { code: 'both', label: 'Both / Ambos', flag: '🌐' }
    ]

    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            padding: '10px',
            background: '#f5f5f5',
            borderRadius: '8px',
            alignItems: 'center'
        }}>
            <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>
                🌐 Language:
            </span>
            {languages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    style={{
                        padding: '8px 16px',
                        border: language === lang.code ? '2px solid #3498db' : '2px solid transparent',
                        background: language === lang.code ? '#3498db' : 'white',
                        color: language === lang.code ? 'white' : '#333',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: language === lang.code ? 'bold' : 'normal',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>{lang.flag}</span>
                    {lang.label}
                </button>
            ))}
        </div>
    )
}
