import React, { useState, useEffect, useRef } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import {
  ShoppingCart, Search, CheckSquare, Square, Trash2, Plus,
  Brain, Store, Package, MapPin, Loader, Mic,
  Lightbulb, Droplet, Paintbrush, Wrench, HelpCircle,
  FileText, Send, Printer
} from 'lucide-react'

// Lifetime Brand Colors
const LIFETIME_COLORS = {
  primary: '#1a3d2f', // dark green
  accent: '#bfc1c2',  // silver
  background: '#f5f6f7',
  white: '#fff',
  black: '#222',
  highlight: '#e6f4ea',
}

const Shopping = () => {
  const [activeTab, setActiveTab] = useState('list') // 'list', 'vendors', 'orders'
  const [shoppingList, setShoppingList] = useState([])
  const [userInput, setUserInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // Mock Vendors for Denver West
  const VENDORS = [
    { id: 'grainger', name: 'Grainger', type: 'General Supplies', contact: 'orders@grainger.com' },
    { id: 'lifefitness', name: 'Life Fitness', type: 'Cardio Parts', contact: 'support@lifefitness.com' },
    { id: 'precor', name: 'Precor', type: 'Cardio Parts', contact: 'parts@precor.com' },
    { id: 'homedepot', name: 'Home Depot', type: 'Local Hardware', contact: 'prodesk@homedepot.com' }
  ]

  // Load list from local storage for the Pilot
  useEffect(() => {
    const saved = localStorage.getItem('denver_west_shopping')
    if (saved) setShoppingList(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('denver_west_shopping', JSON.stringify(shoppingList))
  }, [shoppingList])

  // --- Core Functions ---

  const addItem = (text) => {
    if (!text.trim()) return
    const newItem = {
      id: Date.now(),
      name: text,
      checked: false,
      vendor: 'grainger', // Default
      category: 'Misc',
      quantity: 1,
      dateAdded: new Date().toISOString()
    }
    setShoppingList(prev => [newItem, ...prev])
    setUserInput('')
  }

  const toggleCheck = (id) => {
    setShoppingList(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const deleteItem = (id) => {
    setShoppingList(prev => prev.filter(item => item.id !== id))
  }

  const updateVendor = (id, vendorId) => {
    setShoppingList(prev => prev.map(item =>
      item.id === id ? { ...item, vendor: vendorId } : item
    ))
  }

  // --- Purchase Order Generation ---
  const generatePO = () => {
    const itemsToOrder = shoppingList.filter(i => !i.checked) // Assume unchecked are needed
    if (itemsToOrder.length === 0) return alert('No items to order!')

    // Group by Vendor
    const byVendor = itemsToOrder.reduce((acc, item) => {
      acc[item.vendor] = acc[item.vendor] || []
      acc[item.vendor].push(item)
      return acc
    }, {})

    let poText = `PURCHASE REQUEST - DENVER WEST\nDate: ${new Date().toLocaleDateString()}\n\n`

    Object.entries(byVendor).forEach(([vendorId, items]) => {
      const vendor = VENDORS.find(v => v.id === vendorId)
      poText += `VENDOR: ${vendor?.name.toUpperCase()}\n`
      items.forEach(item => {
        poText += `- [ ] ${item.quantity}x ${item.name}\n`
      })
      poText += '\n'
    })

    // Copy to clipboard
    navigator.clipboard.writeText(poText)
    alert('Purchase Request copied to clipboard! Ready to email to Manager.')
  }

  // --- Voice Input ---
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) return alert('Voice not supported')

      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript
        addItem(text)
      }
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    }
  }

  return (
    <div className="shopping-container" style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0, color: LIFETIME_COLORS.primary }}>🛒 Supply Procurement</h1>
          <p style={{ margin: 0, color: '#666' }}>Denver West - Pilot Program</p>
        </div>
        <button
          onClick={generatePO}
          style={{
            background: LIFETIME_COLORS.primary,
            color: 'white',
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <FileText size={18} /> Generate PO
        </button>
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem(userInput)}
            placeholder="Add item (e.g. '10x LED Bulbs')"
            style={{
              width: '100%',
              padding: '15px 15px 15px 45px',
              borderRadius: 12,
              border: '1px solid #ddd',
              fontSize: 16
            }}
          />
          <Search size={20} style={{ position: 'absolute', left: 15, top: 15, color: '#999' }} />
        </div>
        <button
          onClick={toggleVoice}
          style={{
            width: 50,
            borderRadius: 12,
            border: 'none',
            background: isListening ? '#ff4444' : LIFETIME_COLORS.accent,
            color: isListening ? 'white' : LIFETIME_COLORS.primary,
            cursor: 'pointer'
          }}
        >
          <Mic size={24} />
        </button>
        <button
          onClick={() => addItem(userInput)}
          style={{
            width: 50,
            borderRadius: 12,
            border: 'none',
            background: LIFETIME_COLORS.primary,
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* List */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {shoppingList.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            <ShoppingCart size={48} style={{ marginBottom: 10, opacity: 0.2 }} />
            <p>List is empty. Add items to start tracking.</p>
          </div>
        ) : (
          shoppingList.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #eee',
              background: item.checked ? '#f9f9f9' : 'white'
            }}>
              <button
                onClick={() => toggleCheck(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 15, color: item.checked ? '#4CAF50' : '#ccc' }}
              >
                {item.checked ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>

              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 16,
                  textDecoration: item.checked ? 'line-through' : 'none',
                  color: item.checked ? '#999' : '#333',
                  fontWeight: 500
                }}>
                  {item.name}
                </span>
              </div>

              {/* Vendor Selector */}
              <select
                value={item.vendor}
                onChange={(e) => updateVendor(item.id, e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid #ddd',
                  fontSize: 12,
                  marginRight: 15,
                  background: '#f5f5f5',
                  cursor: 'pointer'
                }}
              >
                {VENDORS.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>

              <button
                onClick={() => deleteItem(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', opacity: 0.6 }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Vendor Legend */}
      <div style={{ marginTop: 30, display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {VENDORS.map(v => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
            <Store size={14} /> {v.name}
          </div>
        ))}
      </div>

    </div>
  )
}

export default Shopping