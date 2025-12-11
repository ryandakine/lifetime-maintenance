export const translations = {
    en: {
        // Header
        appTitle: 'Equipment Tracker',
        welcome: 'Welcome to Cimco Resources',
        welcomeSubtitle: 'Track equipment maintenance and preserve knowledge',
        location: 'Sterling, Illinois',

        // Home Actions
        scanQR: 'Scan QR Code',
        browseEquipment: 'Browse All Equipment',
        myProfile: 'My Profile',
        leaderboard: 'Leaderboard',

        // Stats
        equipmentTracked: 'Equipment Tracked',
        maintenanceLogs: 'Maintenance Logs',

        // Equipment
        equipmentList: 'Equipment List',
        equipmentDetail: 'Equipment Details',
        logMaintenance: 'Log Maintenance',
        maintenanceHistory: 'Maintenance History',

        // Form Fields
        date: 'Date',
        workerName: 'Worker Name',
        workType: 'Work Type',
        workDescription: 'Work Description',
        photos: 'Photos',
        submit: 'Submit',
        cancel: 'Cancel',

        // Work Types
        inspection: 'Inspection',
        repair: 'Repair',
        replacement: 'Replacement',
        preventive: 'Preventive Maintenance',

        // Status
        active: 'Active',
        maintenance: 'Maintenance',
        down: 'Down',

        // Messages
        maintenanceLogged: 'Maintenance logged successfully!',
        equipmentScanned: 'Equipment scanned!',
        favoriteAdded: 'Added to favorites!',
        favoriteRemoved: 'Removed from favorites',
        exportSuccess: 'Export successful!',

        // Operator Mode
        operatorMode: 'Operator Mode',
        checkIn: 'Check In',
        checkOut: 'Check Out',
        onShift: 'On Shift',
        offShift: 'Off Shift',

        // Navigation
        back: 'Back',
        home: 'Home',

        // Loading
        loading: 'Loading...',

        // Language
        language: 'Language',
        english: 'English',
        spanish: 'Spanish',
        both: 'Both'
    },

    es: {
        // Header
        appTitle: 'Rastreador de Equipos',
        welcome: 'Bienvenido a Cimco Resources',
        welcomeSubtitle: 'Rastree el mantenimiento de equipos y preserve el conocimiento',
        location: 'Sterling, Illinois',

        // Home Actions
        scanQR: 'Escanear Código QR',
        browseEquipment: 'Ver Todos los Equipos',
        myProfile: 'Mi Perfil',
        leaderboard: 'Tabla de Clasificación',

        // Stats
        equipmentTracked: 'Equipos Rastreados',
        maintenanceLogs: 'Registros de Mantenimiento',

        // Equipment
        equipmentList: 'Lista de Equipos',
        equipmentDetail: 'Detalles del Equipo',
        logMaintenance: 'Registrar Mantenimiento',
        maintenanceHistory: 'Historial de Mantenimiento',

        // Form Fields
        date: 'Fecha',
        workerName: 'Nombre del Trabajador',
        workType: 'Tipo de Trabajo',
        workDescription: 'Descripción del Trabajo',
        photos: 'Fotos',
        submit: 'Enviar',
        cancel: 'Cancelar',

        // Work Types
        inspection: 'Inspección',
        repair: 'Reparación',
        replacement: 'Reemplazo',
        preventive: 'Mantenimiento Preventivo',

        // Status
        active: 'Activo',
        maintenance: 'Mantenimiento',
        down: 'Fuera de Servicio',

        // Messages
        maintenanceLogged: '¡Mantenimiento registrado con éxito!',
        equipmentScanned: '¡Equipo escaneado!',
        favoriteAdded: '¡Agregado a favoritos!',
        favoriteRemoved: 'Eliminado de favoritos',
        exportSuccess: '¡Exportado con éxito!',

        // Operator Mode
        operatorMode: 'Modo Operador',
        checkIn: 'Registrar Entrada',
        checkOut: 'Registrar Salida',
        onShift: 'En Turno',
        offShift: 'Fuera de Turno',

        // Navigation
        back: 'Atrás',
        home: 'Inicio',

        // Loading
        loading: 'Cargando...',

        // Language
        language: 'Idioma',
        english: 'Inglés',
        spanish: 'Español',
        both: 'Ambos'
    }
}

export function getBilingualText(key, lang = 'en') {
    if (lang === 'both') {
        return `${translations.en[key]} / ${translations.es[key]}`
    }
    return translations[lang][key] || translations.en[key]
}
