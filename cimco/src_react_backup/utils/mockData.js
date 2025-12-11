export const MOCK_STATS = {
    totalEquipment: 12,
    totalLogs: 45,
    totalCost: 15420.50
}

export const MOCK_EQUIPMENT = [
    {
        equipment_id: 'e1',
        equipment_name: 'Industrial Shredder',
        equipment_type: 'Shredder',
        manufacturer: 'American Shredder Co.',
        model: 'AS-5000',
        serial_number: 'SN-2023-001',
        qr_code: 'QR-SHR-001',
        location: 'Main Yard',
        status: 'active',
        notes: 'Primary shredder for ferrous metals.',
        health_score: 92
    },
    {
        equipment_id: 'e2',
        equipment_name: 'Overhead Crane',
        equipment_type: 'Crane',
        manufacturer: 'Konecranes',
        model: 'CXT-2000',
        serial_number: 'SN-2023-002',
        qr_code: 'QR-CRN-001',
        location: 'Building A',
        status: 'active', // Running but dangerous
        notes: '⚠️ CRITICAL: Hoist motor vibration excessive. Bearing failure imminent. Replace immediately.',
        health_score: 16 // Critical Low (Red)
    },
    {
        equipment_id: 'e3',
        equipment_name: 'Metal Baler',
        equipment_type: 'Baler',
        manufacturer: 'Harris Equipment',
        model: 'HB-800',
        serial_number: 'SN-2023-004',
        qr_code: 'QR-BAL-001',
        location: 'Main Yard',
        status: 'maintenance', // Maintenance (Yellow)
        notes: 'Hydraulic leak reported.',
        health_score: 65 // Warning health
    },
    {
        equipment_id: 'e4',
        equipment_name: 'Forklift #4',
        equipment_type: 'Forklift',
        manufacturer: 'Toyota',
        model: '8FG25',
        serial_number: 'SN-2023-005',
        qr_code: 'QR-FRK-001',
        location: 'Warehouse',
        status: 'active',
        notes: 'Regular service due soon.',
        health_score: 88
    },
    {
        equipment_id: 'e5',
        equipment_name: 'Conveyor Belt System',
        equipment_type: 'Conveyor',
        manufacturer: 'ConveyAll',
        model: 'CB-1500',
        serial_number: 'SN-2023-003',
        qr_code: 'QR-CNV-001',
        location: 'Processing Area',
        status: 'down', // The only one actually DOWN
        notes: 'Belt snapped during shift.',
        health_score: 0
    }
]

export const MOCK_LOGS = [
    {
        log_id: 1,
        work_date: new Date().toISOString(),
        worker_name: 'Mike Johnson',
        work_type: 'Repair',
        work_description: 'Replaced hydraulic pump and checked all fluid levels. System running smoothly.',
        cost: 450.00,
        parts_used: 'Hydraulic Pump HP-200',
        hours_spent: 3.5
    },
    {
        log_id: 2,
        work_date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        worker_name: 'Sarah Chen',
        work_type: 'Inspection',
        work_description: 'Routine safety inspection. All systems nominal.',
        cost: 0,
        hours_spent: 1.0
    },
    {
        log_id: 3,
        work_date: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
        worker_name: 'Alex Rodriguez',
        work_type: 'Preventive Maintenance',
        work_description: 'Oil change and filter replacement.',
        cost: 120.50,
        parts_used: 'Oil Filter, 5gal Hydraulic Oil',
        hours_spent: 1.5
    }
]
