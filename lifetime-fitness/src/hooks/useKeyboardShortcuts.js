import { useEffect, useCallback, useRef, useState } from 'react'

export const useKeyboardShortcuts = (shortcuts = {}) => {
  const shortcutsRef = useRef(shortcuts)

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = event
    
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return
    }

    // Build key combination string
    const keys = []
    if (ctrlKey || metaKey) keys.push('Ctrl')
    if (altKey) keys.push('Alt')
    if (shiftKey) keys.push('Shift')
    keys.push(key.toUpperCase())

    const keyCombo = keys.join('+')
    
    // Find and execute matching shortcut
    const shortcut = shortcutsRef.current[keyCombo]
    if (shortcut && typeof shortcut === 'function') {
      event.preventDefault()
      shortcut(event)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { handleKeyDown }
}

// Common keyboard shortcuts for the app
export const createAppShortcuts = (actions) => ({
  // Navigation shortcuts
  'Ctrl+1': () => actions.switchToTab?.('tasks'),
  'Ctrl+2': () => actions.switchToTab?.('shopping'),
  'Ctrl+3': () => actions.switchToTab?.('knowledge'),
  'Ctrl+4': () => actions.switchToTab?.('email'),
  'Ctrl+5': () => actions.switchToTab?.('photos'),
  
  // Action shortcuts
  'Ctrl+N': () => actions.createNew?.(),
  'Ctrl+S': () => actions.save?.(),
  'Ctrl+Z': () => actions.undo?.(),
  'Ctrl+Y': () => actions.redo?.(),
  'Ctrl+F': () => actions.search?.(),
  'Ctrl+/': () => actions.showHelp?.(),
  
  // Voice shortcuts
  'Ctrl+Space': () => actions.toggleVoice?.(),
  'Alt+V': () => actions.startVoice?.(),
  
  // Theme shortcuts
  'Ctrl+T': () => actions.toggleTheme?.(),
  
  // Accessibility shortcuts
  'Alt+1': () => actions.increaseFontSize?.(),
  'Alt+2': () => actions.decreaseFontSize?.(),
  'Alt+3': () => actions.toggleHighContrast?.(),
  
  // Quick actions
  'Ctrl+Enter': () => actions.quickAdd?.(),
  'Ctrl+Shift+A': () => actions.selectAll?.(),
  'Escape': () => actions.cancel?.()
})

// Accessibility hook
export const useAccessibility = () => {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement
    
    // Font size
    root.style.setProperty('--font-size-base', `${fontSize}px`)
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [fontSize, highContrast, reducedMotion])

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }, [])

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 12))
  }, [])

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev)
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev)
  }, [])

  return {
    fontSize,
    highContrast,
    reducedMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion
  }
}

// Focus management hook
export const useFocusManagement = () => {
  const focusableElements = useRef([])
  const currentFocusIndex = useRef(0)

  const updateFocusableElements = useCallback(() => {
    const elements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusableElements.current = Array.from(elements).filter(el => 
      !el.disabled && el.offsetParent !== null
    )
  }, [])

  const focusNext = useCallback(() => {
    updateFocusableElements()
    if (focusableElements.current.length === 0) return
    
    currentFocusIndex.current = (currentFocusIndex.current + 1) % focusableElements.current.length
    focusableElements.current[currentFocusIndex.current]?.focus()
  }, [updateFocusableElements])

  const focusPrevious = useCallback(() => {
    updateFocusableElements()
    if (focusableElements.current.length === 0) return
    
    currentFocusIndex.current = currentFocusIndex.current === 0 
      ? focusableElements.current.length - 1 
      : currentFocusIndex.current - 1
    focusableElements.current[currentFocusIndex.current]?.focus()
  }, [updateFocusableElements])

  const focusFirst = useCallback(() => {
    updateFocusableElements()
    if (focusableElements.current.length > 0) {
      currentFocusIndex.current = 0
      focusableElements.current[0]?.focus()
    }
  }, [updateFocusableElements])

  const focusLast = useCallback(() => {
    updateFocusableElements()
    if (focusableElements.current.length > 0) {
      currentFocusIndex.current = focusableElements.current.length - 1
      focusableElements.current[currentFocusIndex.current]?.focus()
    }
  }, [updateFocusableElements])

  return {
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    updateFocusableElements
  }
}

// Screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const announceError = useCallback((message) => {
    announce(message, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message) => {
    announce(message, 'polite')
  }, [announce])

  return {
    announce,
    announceError,
    announceSuccess
  }
}

// CSS for accessibility
export const accessibilityCSS = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .high-contrast {
    --color-primary: #000000;
    --color-secondary: #0000ff;
    --color-background: #ffffff;
    --color-surface: #ffffff;
    --color-text: #000000;
    --color-text-secondary: #000000;
    --color-border: #000000;
    --color-border-light: #000000;
  }

  .reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
` 