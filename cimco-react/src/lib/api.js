// API Service - Connects to Rust Backend (cimco-server)

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ============ Authentication ============
export async function login(username, password) {
    return fetchAPI('/login', {
        body: { username, password }
    });
}

// ============ Parts / Inventory ============
export async function getPartsPaginated(page = 1, pageSize = 50, categoryFilter = null, searchQuery = null) {
    return fetchAPI('/get_parts_paginated', {
        body: {
            page,
            page_size: pageSize,
            category_filter: categoryFilter,
            search_query: searchQuery
        }
    });
}

export async function updatePartQuantity(id, quantityChange) {
    return fetchAPI('/update_part_quantity', {
        body: { id, quantity_change: quantityChange }
    });
}

export async function updatePartLocation(id, location) {
    return fetchAPI('/update_part_location', {
        body: { id, location }
    });
}

// ============ Equipment ============
export async function getEquipment() {
    return fetchAPI('/get_equipment', { body: {} });
}

// ============ Stats ============
export async function getStats() {
    return fetchAPI('/get_stats', { body: {} });
}

// Default export for convenience
export default {
    login,
    getPartsPaginated,
    updatePartQuantity,
    updatePartLocation,
    getEquipment,
    getStats,
};
