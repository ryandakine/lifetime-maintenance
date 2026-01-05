import { useState, useEffect } from 'react'

export function useEquipmentSearch(equipment) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [filteredEquipment, setFilteredEquipment] = useState(equipment)

    useEffect(() => {
        if (!equipment) {
            setFilteredEquipment([])
            return
        }

        let filtered = [...equipment]

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(item =>
                item.equipment_name?.toLowerCase().includes(term) ||
                item.qr_code_id?.toLowerCase().includes(term) ||
                item.equipment_type?.toLowerCase().includes(term) ||
                item.location_zone?.toLowerCase().includes(term) ||
                item.manufacturer?.toLowerCase().includes(term)
            )
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter)
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(item => item.equipment_type === typeFilter)
        }

        setFilteredEquipment(filtered)
    }, [equipment, searchTerm, statusFilter, typeFilter])

    const clearFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setTypeFilter('all')
    }

    return {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        filteredEquipment,
        clearFilters,
        hasActiveFilters: searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
    }
}
