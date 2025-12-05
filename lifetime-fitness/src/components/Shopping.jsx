import React, { useState, useEffect, useRef } from 'react'
import {
  ShoppingCart, Search, CheckSquare, Square, Trash2, Plus,
  Brain, Store, Package, MapPin, Loader, Mic,
  Lightbulb, Droplet, Paintbrush, Wrench, HelpCircle,
  FileText, Send, Printer, ExternalLink, AlertTriangle
} from 'lucide-react'

// Lifetime Brand Colors
const LIFETIME_COLORS = {
  primary: '#1a3d2f', // dark green
  accent: '#bfc1c2',  // silver
  background: '#f5f6f7',
  white: '#fff',
  black: '#222',
  highlight: '#e6f4ea',
  grainger: '#b71234', // Grainger Red
  homedepot: '#f96302' // Home Depot Orange
}

const Shopping = () => {
  const [shoppingList, setShoppingList] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const recognitionRef = useRef(null)

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
      vendor: 'unknown',
      partNumber: '',
      location: '',
      tools: [],
      quantity: 1,
      dateAdded: new Date().toISOString()
    }
    setShoppingList(prev => [newItem, ...prev])
    setUserInput('')
  }

  // The "Maintenance Planner" Logic
  const analyzeProblem = async () => {
    if (!userInput.trim()) return
    setIsAnalyzing(true)

    // Simulate AI Analysis (Perplexity would do this in production)
    // Logic: Problem -> Parts -> Grainger Check -> Home Depot Fallback
    setTimeout(() => {
      let newItems = []
      const problem = userInput.toLowerCase()

      if (problem.includes('leak') || problem.includes('faucet')) {
        newItems = [
          { name: 'Moen 1225 Cartridge', vendor: 'grainger', partNumber: '1WDE4', location: 'Online', tools: ['Allen Wrench', 'Channel Locks'] },
          { name: 'O-Ring Kit', vendor: 'homedepot', partNumber: '', location: 'Aisle 14, Bay 2', tools: [] }
        ]
      } else if (problem.includes('treadmill') || problem.includes('belt')) {
        newItems = [
          { name: 'Drive Belt (Life Fitness 95T)', vendor: 'grainger', partNumber: '45K123', location: 'Online', tools: ['Tension Gauge', 'Socket Set'] },
          { name: 'Deck Lubricant', vendor: 'grainger', partNumber: '22L998', location: 'Online', tools: [] }
        ]
      } else if (problem.includes('light') || problem.includes('bulb')) {
        newItems = [
          { name: 'T8 LED Tube 4ft', vendor: 'grainger', partNumber: '54EP21', location: 'Online', tools: ['Ladder'] },
          { name: 'Wire Nuts (Assorted)', vendor: 'homedepot', partNumber: '', location: 'Aisle 3, Bay 12', tools: ['Wire Strippers'] }
        ]
      } else {
        // Generic Fallback
        newItems = [{ name: userInput, vendor: 'unknown', partNumber: '', location: '', tools: [] }]
      }

      const formattedItems = newItems.map(item => ({
        id: Date.now() + Math.random(),
        name: item.name,
        checked: false,
        vendor: item.vendor,
        partNumber: item.partNumber,
        location: item.location,
        tools: item.tools || [],
        quantity: 1,
        dateAdded: new Date().toISOString()
      }))

      setShoppingList(prev => [...formattedItems, ...prev])
      setIsAnalyzing(false)
      setUserInput('')
    }, 1500)
  }

  const toggleCheck = (id) => {
    setShoppingList(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const deleteItem = (id) => {
    setShoppingList(prev => prev.filter(item => item.id !== id))
  }

  // --- Purchase Order Generation ---
  const generatePO = () => {
    const itemsToOrder = shoppingList.filter(i => !i.checked)
    if (itemsToOrder.length === 0) return alert('No items to order!')

    // Separate Grainger (Workday) vs Home Depot (Runner)
    const graingerItems = itemsToOrder.filter(i => i.vendor === 'grainger')
    const hdItems = itemsToOrder.filter(i => i.vendor === 'homedepot')

    let poText = `MAINTENANCE PLAN - DENVER WEST\nDate: ${new Date().toLocaleDateString()}\n\n`

    if (graingerItems.length > 0) {
      poText += `📦 WORKDAY ORDER (GRAINGER)\n`
      poText += `---------------------------\n`
      graingerItems.forEach(item => {
        poText += `- Part #: ${item.partNumber} | ${item.name} (${item.quantity})\n`
      })
      poText += `\n`
    }

    if (hdItems.length > 0) {
      poText += `🛒 HOME DEPOT RUN (SHOPPING LIST)\n`
      poText += `-------------------------------\n`
      hdItems.forEach(item => {
        poText += `- ${item.location} | ${item.name} (${item.quantity})\n`
      })
      poText += `\n`
    }

    // Tools Checklist
    const allTools = [...new Set(itemsToOrder.flatMap(i => i.tools))]
    if (allTools.length > 0) {
      poText += `🔧 TOOLS NEEDED\n`
      poText += `---------------\n`
      allTools.forEach(tool => poText += `- [ ] ${tool}\n`)
    }

    navigator.clipboard.writeText(poText)
    alert('Plan copied! Ready for Workday & Home Depot run.')
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
        setUserInput(text)
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
          <h1 style={{ margin: 0, color: LIFETIME_COLORS.primary }}>🛒 Smart Procurement</h1>
          <p style={{ margin: 0, color: '#666' }}>Denver West Pilot • Grainger First Strategy</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href="https://www.grainger.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: LIFETIME_COLORS.grainger,
              color: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 'bold'
            }}
          >
            <ExternalLink size={18} /> Grainger Portal
          </a>
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
            <FileText size={18} /> Export Plan
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div style={{ background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 30 }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>What needs fixing?</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyzeProblem()}
              placeholder="Describe the problem (e.g. 'Leaky faucet in locker room')"
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
            onClick={analyzeProblem}
            disabled={isAnalyzing}
            style={{
              padding: '0 24px',
              borderRadius: 12,
              border: 'none',
              background: LIFETIME_COLORS.primary,
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {isAnalyzing ? <Loader className="spin" size={20} /> : <Brain size={20} />}
            {isAnalyzing ? 'Analyzing...' : 'Find Parts'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#666', marginTop: 8, marginLeft: 4 }}>
          * AI will prioritize Grainger Part #s for Workday, then fallback to Home Depot.
        </p>
      </div>

      {/* List */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {shoppingList.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            <ShoppingCart size={48} style={{ marginBottom: 10, opacity: 0.2 }} />
            <p>List is empty. Describe a problem to generate a parts list.</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 16,
                    textDecoration: item.checked ? 'line-through' : 'none',
                    color: item.checked ? '#999' : '#333',
                    fontWeight: 600
                  }}>
                    {item.name}
                  </span>
                  {item.tools.length > 0 && (
                    <span style={{ fontSize: 12, background: '#eee', padding: '2px 8px', borderRadius: 10, color: '#666' }}>
                      🔧 {item.tools.join(', ')}
                    </span>
                  )}
                </div>

                {/* Sourcing Info */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 13 }}>
                  {item.vendor === 'grainger' && (
                    <a
                      href={`https://www.grainger.com/search?searchQuery=${item.partNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: LIFETIME_COLORS.grainger, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                      title="Open in Grainger"
                    >
                      <Package size={12} /> Grainger Part #: {item.partNumber} <ExternalLink size={10} />
                    </a>
                  )}
                  {item.vendor === 'homedepot' && (
                    <span style={{ color: LIFETIME_COLORS.homedepot, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Store size={12} /> Home Depot: {item.location}
                    </span>
                  )}
                  {item.vendor === 'unknown' && (
                    <span style={{ color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HelpCircle size={12} /> Source Unknown
                    </span>
                  )}
                </div>
              </div>

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

    </div>
  )
}

export default Shopping