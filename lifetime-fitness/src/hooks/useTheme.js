import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#1a3d2f',
      secondary: '#007BFF',
      background: '#f5f6f7',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowLight: 'rgba(0, 0, 0, 0.05)'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#4ade80',
      secondary: '#60a5fa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      borderLight: '#475569',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowLight: 'rgba(0, 0, 0, 0.2)'
    }
  },
  auto: {
    name: 'auto',
    colors: null // Will be computed based on system preference
  }
}

export const useTheme = () => {
  const [themePreference, setThemePreference] = useLocalStorage('theme-preference', 'auto')
  const [systemTheme, setSystemTheme] = useState('light')

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Get current active theme
  const getCurrentTheme = useCallback(() => {
    if (themePreference === 'auto') {
      return themes[systemTheme]
    }
    return themes[themePreference]
  }, [themePreference, systemTheme])

  // Get theme colors
  const getThemeColors = useCallback(() => {
    const theme = getCurrentTheme()
    return theme.colors
  }, [getCurrentTheme])

  // Apply theme to document
  useEffect(() => {
    const colors = getThemeColors()
    if (!colors) return

    const root = document.documentElement
    
    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Apply theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    document.body.classList.add(`theme-${getCurrentTheme().name}`)
  }, [getCurrentTheme, getThemeColors])

  // Theme toggle function
  const toggleTheme = useCallback(() => {
    const currentTheme = getCurrentTheme().name
    if (currentTheme === 'light') {
      setThemePreference('dark')
    } else if (currentTheme === 'dark') {
      setThemePreference('auto')
    } else {
      setThemePreference('light')
    }
  }, [getCurrentTheme, setThemePreference])

  // Set specific theme
  const setTheme = useCallback((themeName) => {
    if (themes[themeName]) {
      setThemePreference(themeName)
    }
  }, [setThemePreference])

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => {
    const currentTheme = getCurrentTheme()
    return {
      theme: currentTheme,
      colors: getThemeColors(),
      themePreference,
      systemTheme,
      toggleTheme,
      setTheme,
      isDark: currentTheme.name === 'dark',
      isLight: currentTheme.name === 'light',
      isAuto: themePreference === 'auto'
    }
  }, [getCurrentTheme, getThemeColors, themePreference, systemTheme, toggleTheme, setTheme])
}

// CSS Variables for theme colors
export const themeCSSVariables = `
  :root {
    --color-primary: #1a3d2f;
    --color-secondary: #007BFF;
    --color-background: #f5f6f7;
    --color-surface: #ffffff;
    --color-text: #1f2937;
    --color-text-secondary: #6b7280;
    --color-border: #e5e7eb;
    --color-border-light: #f3f4f6;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;
    --color-shadow: rgba(0, 0, 0, 0.1);
    --color-shadow-light: rgba(0, 0, 0, 0.05);
  }

  .theme-dark {
    --color-primary: #4ade80;
    --color-secondary: #60a5fa;
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-border: #334155;
    --color-border-light: #475569;
    --color-success: #22c55e;
    --color-warning: #fbbf24;
    --color-error: #f87171;
    --color-info: #60a5fa;
    --color-shadow: rgba(0, 0, 0, 0.3);
    --color-shadow-light: rgba(0, 0, 0, 0.2);
  }

  .theme-auto {
    /* Will be computed based on system preference */
  }

  @media (prefers-color-scheme: dark) {
    .theme-auto {
      --color-primary: #4ade80;
      --color-secondary: #60a5fa;
      --color-background: #0f172a;
      --color-surface: #1e293b;
      --color-text: #f1f5f9;
      --color-text-secondary: #94a3b8;
      --color-border: #334155;
      --color-border-light: #475569;
      --color-success: #22c55e;
      --color-warning: #fbbf24;
      --color-error: #f87171;
      --color-info: #60a5fa;
      --color-shadow: rgba(0, 0, 0, 0.3);
      --color-shadow-light: rgba(0, 0, 0, 0.2);
    }
  }
` 