import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('cimco_language') || 'en'
    })

    useEffect(() => {
        localStorage.setItem('cimco_language', language)
    }, [language])

    const value = {
        language,
        setLanguage,
        isEnglish: language === 'en',
        isSpanish: language === 'es',
        isBoth: language === 'both'
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}
