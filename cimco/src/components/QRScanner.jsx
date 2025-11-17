import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      )
      setScanning(true)
    } catch (err) {
      console.error('Scanner error:', err)
      setError('Unable to access camera. Please check permissions or enter QR code manually.')
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }

  const onScanSuccess = async (decodedText) => {
    console.log('QR Code scanned:', decodedText)
    await fetchEquipmentData(decodedText)
  }

  const onScanError = (err) => {
    // Ignore scanning errors (happens continuously when no QR code detected)
  }

  const fetchEquipmentData = async (qrCode) => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('qr_code_id', qrCode)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError(`QR code "${qrCode}" not found in database. Please register this equipment first.`)
        } else {
          throw error
        }
        return
      }

      if (data) {
        await stopScanner()
        onScan(data)
      }
    } catch (err) {
      console.error('Database error:', err)
      setError('Error loading equipment data. Please try again.')
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      fetchEquipmentData(manualCode.trim().toUpperCase())
    }
  }

  return (
    <div className="qr-scanner">
      <h2>Scan Equipment QR Code</h2>

      <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="manual-entry">
        <p>Or enter QR code manually:</p>
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="e.g., CIMCO001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="manual-input"
          />
          <button type="submit" className="submit-button">
            Load Equipment
          </button>
        </form>
      </div>

      <div className="scanner-help">
        <p>📱 Point your camera at the QR code on the equipment</p>
        <p>💡 Make sure the QR code is well-lit and in focus</p>
      </div>
    </div>
  )
}
