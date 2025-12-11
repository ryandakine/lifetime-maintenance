/**
 * Feature Flags Configuration
 * Centralized feature toggle system for gradual rollout
 */

// Environment-based feature flags
export const FEATURES = {
    // Photo features
    photoAnnotations: import.meta.env.VITE_FEATURE_ANNOTATIONS === 'true',
    offlinePhotos: import.meta.env.VITE_FEATURE_OFFLINE === 'true',
    enhancedAI: import.meta.env.VITE_FEATURE_ENHANCED_AI === 'true',

    // Voice features
    voiceInput: import.meta.env.VITE_FEATURE_VOICE === 'true',
    voiceCommands: import.meta.env.VITE_FEATURE_VOICE_COMMANDS === 'true',

    // Task features
    taskTemplates: import.meta.env.VITE_FEATURE_TASK_TEMPLATES !== 'false', // Default ON
    taskAnalytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
    smartSuggestions: import.meta.env.VITE_FEATURE_SUGGESTIONS === 'true',

    // Integration features
    githubIntegration: import.meta.env.VITE_FEATURE_GITHUB === 'true',
    emailAutomation: import.meta.env.VITE_FEATURE_EMAIL === 'true',

    // Performance features
    lazyLoading: import.meta.env.VITE_FEATURE_LAZY_LOAD !== 'false', // Default ON
    infiniteScroll: import.meta.env.VITE_FEATURE_INFINITE_SCROLL === 'true',
}

// Runtime feature checks with fallback
export const isFeatureEnabled = (featureName) => {
    return FEATURES[featureName] ?? false
}

// Feature groups for bulk enabling/disabling
export const FEATURE_GROUPS = {
    experimental: ['enhancedAI', 'smartSuggestions', 'infiniteScroll'],
    beta: ['photoAnnotations', 'taskAnalytics'],
    stable: ['taskTemplates', 'lazyLoading'],
}

export const isGroupEnabled = (groupName) => {
    const features = FEATURE_GROUPS[groupName] || []
    return features.every(feature => FEATURES[feature])
}

export default FEATURES
