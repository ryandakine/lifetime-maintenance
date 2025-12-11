import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportMaintenanceLogsToPDF(equipment, logs) {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text(`Maintenance History - ${equipment.equipment_name}`, 14, 22)

    // Equipment info
    doc.setFontSize(10)
    doc.text(`QR Code: ${equipment.qr_code_id}`, 14, 32)
    doc.text(`Type: ${equipment.equipment_type}`, 14, 38)
    doc.text(`Location: ${equipment.location_zone || 'N/A'}`, 14, 44)

    // Table
    const tableData = logs.map(log => [
        new Date(log.work_date).toLocaleDateString(),
        log.work_type,
        log.worker_name,
        log.work_description.substring(0, 40) + '...',
        log.cost ? `$${parseFloat(log.cost).toFixed(2)}` : 'N/A'
    ])

    doc.autoTable({
        startY: 52,
        head: [['Date', 'Type', 'Worker', 'Description', 'Cost']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] }
    })

    // Save
    doc.save(`${equipment.equipment_name}_maintenance_history.pdf`)
}

export function exportToCSV(equipment, logs) {
    const headers = ['Date', 'Type', 'Worker', 'Description', 'Parts Used', 'Hours', 'Cost']
    const rows = logs.map(log => [
        new Date(log.work_date).toLocaleDateString(),
        log.work_type,
        log.worker_name,
        `"${log.work_description.replace(/"/g, '""')}"`,
        `"${(log.parts_used || '').replace(/"/g, '""')}"`,
        log.hours_spent || '',
        log.cost || ''
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${equipment.equipment_name}_maintenance_history.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
