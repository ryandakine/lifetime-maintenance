// Equipment Types
export const EQUIPMENT_TYPES = {
    SHREDDER: 'Shredder',
    CRANE: 'Crane',
    CONVEYOR: 'Conveyor',
    BALER: 'Baler',
    FORKLIFT: 'Forklift'
}

// Equipment Type Icons
export const EQUIPMENT_ICONS = {
    [EQUIPMENT_TYPES.SHREDDER]: '🏭',
    [EQUIPMENT_TYPES.CRANE]: '🏗️',
    [EQUIPMENT_TYPES.CONVEYOR]: '📦',
    [EQUIPMENT_TYPES.BALER]: '🗜️',
    [EQUIPMENT_TYPES.FORKLIFT]: '🚜'
}

// Equipment Status
export const EQUIPMENT_STATUS = {
    ACTIVE: 'active',
    MAINTENANCE: 'maintenance',
    DOWN: 'down',
    RETIRED: 'retired'
}

// Status Colors
export const STATUS_COLORS = {
    [EQUIPMENT_STATUS.ACTIVE]: '#4CAF50',
    [EQUIPMENT_STATUS.MAINTENANCE]: '#FF9800',
    [EQUIPMENT_STATUS.DOWN]: '#f44336',
    [EQUIPMENT_STATUS.RETIRED]: '#9E9E9E'
}

// Work Types
export const WORK_TYPES = {
    PREVENTIVE: 'preventive',
    REPAIR: 'repair',
    INSPECTION: 'inspection',
    EMERGENCY: 'emergency'
}

// Work Type Icons
export const WORK_TYPE_ICONS = {
    [WORK_TYPES.PREVENTIVE]: '🔧',
    [WORK_TYPES.REPAIR]: '🔨',
    [WORK_TYPES.INSPECTION]: '🔍',
    [WORK_TYPES.EMERGENCY]: '🚨'
}

// Work Type Labels
export const WORK_TYPE_LABELS = {
    [WORK_TYPES.PREVENTIVE]: 'Preventive Maintenance',
    [WORK_TYPES.REPAIR]: 'Repair',
    [WORK_TYPES.INSPECTION]: 'Inspection',
    [WORK_TYPES.EMERGENCY]: 'Emergency'
}

// Photo Upload Limits
export const PHOTO_LIMITS = {
    MAX_COUNT: 5,
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    QUALITY: 0.8
}

// Storage Buckets
export const STORAGE_BUCKETS = {
    MAINTENANCE_PHOTOS: 'maintenance-photos'
}
