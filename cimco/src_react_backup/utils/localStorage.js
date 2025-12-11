// LocalStorage utility functions

const STORAGE_KEYS = {
    LAST_WORKER_NAME: 'cimco_last_worker',
    FAVORITES: 'cimco_favorites',
    RECENT_EQUIPMENT: 'cimco_recent_equipment'
}

export const storage = {
    // Get item from localStorage
    get(key) {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch (error) {
            console.error('Error reading from localStorage:', error)
            return null
        }
    },

    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        } catch (error) {
            console.error('Error writing to localStorage:', error)
            return false
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error('Error removing from localStorage:', error)
            return false
        }
    },

    // Clear all items
    clear() {
        try {
            localStorage.clear()
            return true
        } catch (error) {
            console.error('Error clearing localStorage:', error)
            return false
        }
    }
}

// Specific helper functions
export const getLastWorkerName = () => {
    return storage.get(STORAGE_KEYS.LAST_WORKER_NAME) || ''
}

export const setLastWorkerName = (name) => {
    return storage.set(STORAGE_KEYS.LAST_WORKER_NAME, name)
}

export const getFavorites = () => {
    return storage.get(STORAGE_KEYS.FAVORITES) || []
}

export const setFavorites = (favorites) => {
    return storage.set(STORAGE_KEYS.FAVORITES, favorites)
}

export const addFavorite = (equipmentId) => {
    const favorites = getFavorites()
    if (!favorites.includes(equipmentId)) {
        favorites.push(equipmentId)
        setFavorites(favorites)
    }
}

export const removeFavorite = (equipmentId) => {
    const favorites = getFavorites()
    const filtered = favorites.filter(id => id !== equipmentId)
    setFavorites(filtered)
}

export const isFavorite = (equipmentId) => {
    const favorites = getFavorites()
    return favorites.includes(equipmentId)
}

export const getRecentEquipment = () => {
    return storage.get(STORAGE_KEYS.RECENT_EQUIPMENT) || []
}

export const addRecentEquipment = (equipmentId) => {
    const recent = getRecentEquipment()
    // Remove if already exists
    const filtered = recent.filter(id => id !== equipmentId)
    // Add to front
    filtered.unshift(equipmentId)
    // Keep only last 5
    const trimmed = filtered.slice(0, 5)
    storage.set(STORAGE_KEYS.RECENT_EQUIPMENT, trimmed)
}
