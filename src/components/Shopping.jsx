import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  ShoppingCart, 
  Search, 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Brain,
  Store,
  Package,
  MapPin,
  RotateCcw,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Filter,
  List,
  Grid
} from 'lucide-react'

const Shopping = () => {
  const [shoppingLists, setShoppingLists] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [userInput, setUserInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load shopping lists and tasks on component mount
  useEffect(() => {
    loadShoppingLists()
    loadTasks()
  }, [])

  const loadShoppingLists = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .select('*')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setShoppingLists(data || [])
      console.log('Shopping lists loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading shopping lists:', error)
      showMessage('error', 'Failed to load shopping lists')
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('id, task_list, status')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const processShoppingInput = async () => {
    if (!userInput.trim()) return

    try {
      setProcessing(true)
      const perplexityApiKey = API_KEYS.PERPLEXITY_PRO

      if (!perplexityApiKey || perplexityApiKey === 'your-perplexity-key') {
        console.warn('Perplexity Pro API key not configured, using fallback parsing')
        // Fallback: simple parsing without API
        const items = userInput.split('\n').filter(line => line.trim()).map(item => ({
          name: item,
          grainger_part: 'N/A',
          grainger_url: '',
          home_depot_aisle: 'N/A',
          home_depot_url: '',
          alternatives: [],
          checked: false
        }))
        
        await saveShoppingList(items)
        return
      }

      console.log('Processing shopping input with Perplexity Pro...')

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant that finds Grainger part numbers and Home Depot aisle information for maintenance and repair items. Always provide accurate, specific information.`
            },
            {
              role: 'user',
              content: `Find Grainger part numbers and Home Depot aisle information for these maintenance items. Assume Home Depot store at 123 Main St, Denver, CO.

Items: ${userInput}

For each item, provide:
1. Grainger part number and direct link
2. Home Depot aisle location and direct link
3. Alternative options (other brands/suppliers)

Return as JSON:
{
  "items": [
    {
      "name": "item name",
      "grainger_part": "part number",
      "grainger_url": "direct link to product",
      "home_depot_aisle": "aisle location",
      "home_depot_url": "direct link to product",
      "alternatives": ["alternative 1", "alternative 2"]
    }
  ]
}

Be specific with aisle numbers and part numbers. If exact match not found, provide closest alternative.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error:', response.status, errorText)
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices[0].message.content
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Perplexity response')
      }

      const parsedData = JSON.parse(jsonMatch[0])
      console.log('Perplexity parsed shopping items:', parsedData)

      if (parsedData.items && Array.isArray(parsedData.items)) {
        // Add checked property to each item
        const itemsWithChecked = parsedData.items.map(item => ({
          ...item,
          checked: false
        }))
        
        await saveShoppingList(itemsWithChecked)
      } else {
        throw new Error('Invalid item structure from Perplexity')
      }

    } catch (error) {
      console.error('Error processing shopping input:', error)
      showMessage('error', 'Failed to process input. Using fallback parsing.')
      
      // Fallback: simple parsing
      const items = userInput.split('\n').filter(line => line.trim()).map(item => ({
        name: item,
        grainger_part: 'N/A',
        grainger_url: '',
        home_depot_aisle: 'N/A',
        home_depot_url: '',
        alternatives: [],
        checked: false
      }))
      
      await saveShoppingList(items)
    } finally {
      setProcessing(false)
      setUserInput('')
    }
  }

  const saveShoppingList = async (items) => {
    try {
      const { error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .insert({
          user_id: 'current-user',
          task_id: selectedTaskId || null,
          items_json: items,
          store_address: '123 Main St, Denver, CO',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      console.log(`Shopping list generated with ${items.length} items`)
      showMessage('success', `Shopping list created with ${items.length} items`)
      
      await loadShoppingLists()
    } catch (error) {
      console.error('Error saving shopping list:', error)
      showMessage('error', 'Failed to save shopping list')
    }
  }

  const updateItemChecked = async (listId, itemIndex, checked) => {
    try {
      const list = shoppingLists.find(l => l.id === listId)
      if (!list) return

      const updatedItems = [...list.items_json]
      updatedItems[itemIndex].checked = checked

      const { error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .update({ items_json: updatedItems })
        .eq('id', listId)

      if (error) throw error

      setShoppingLists(shoppingLists.map(l => 
        l.id === listId ? { ...l, items_json: updatedItems } : l
      ))
      
      console.log(`Item ${itemIndex} ${checked ? 'checked' : 'unchecked'} in list ${listId}`)
    } catch (error) {
      console.error('Error updating item checked status:', error)
      showMessage('error', 'Failed to update item status')
    }
  }

  const deleteShoppingList = async (listId) => {
    try {
      const { error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .delete()
        .eq('id', listId)

      if (error) throw error

      setShoppingLists(shoppingLists.filter(list => list.id !== listId))
      console.log(`Shopping list ${listId} deleted`)
      showMessage('success', 'Shopping list deleted')
    } catch (error) {
      console.error('Error deleting shopping list:', error)
      showMessage('error', 'Failed to delete shopping list')
    }
  }

  const getCheckedCount = (items) => {
    return items.filter(item => item.checked).length
  }

  const getTotalCount = (items) => {
    return items.length
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  return (
    <div className="container">
      {!isOnline && (
        <div className="offline-alert">
          ⚠️ You are currently offline. Some features may not work properly.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Shopping Input Section */}
      <div className="card">
        <h3>Generate Shopping List</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Describe what you need to fix or maintain, and I'll find Grainger part numbers and Home Depot aisle information.
        </p>
        
        <div className="form-group">
          <label className="form-label">Link to Task (optional)</label>
          <select
            className="form-input"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">Select a task...</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.task_list} ({task.status})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">What do you need to fix or maintain?</label>
          <textarea
            className="form-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Example: Fix concrete cracks, replace light bulbs, repair HVAC filter"
            rows={4}
            disabled={processing}
          />
        </div>

        <button
          className="btn"
          onClick={processShoppingInput}
          disabled={!userInput.trim() || processing}
        >
          {processing ? (
            <>
              <Loader size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
              Searching for parts...
            </>
          ) : (
            <>
              <Search size={16} style={{ marginRight: '0.5rem' }} />
              Find Parts & Aisles
            </>
          )}
        </button>

        {/* Store Information */}
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            <Store size={16} style={{ marginRight: '0.5rem' }} />
            Store Information
          </h4>
          <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
            <div><strong>Home Depot:</strong> 123 Main St, Denver, CO</div>
            <div><strong>Grainger:</strong> Online parts lookup with direct links</div>
          </div>
        </div>
      </div>

      {/* Shopping Lists */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Shopping Lists</h3>
          <button
            className="btn btn-secondary"
            onClick={loadShoppingLists}
            disabled={loading}
          >
            <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
            Refresh
          </button>
        </div>
        
        {loading && shoppingLists.length === 0 ? (
          <div className="loading">Loading shopping lists...</div>
        ) : shoppingLists.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No shopping lists yet. Generate one above to get started!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shoppingLists.map(list => {
              const linkedTask = tasks.find(t => t.id === list.task_id)
              const checkedCount = getCheckedCount(list.items_json)
              const totalCount = getTotalCount(list.items_json)
              
              return (
                <div key={list.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: 'var(--light-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <ShoppingCart size={16} style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                          Shopping List
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                          {new Date(list.created_at).toLocaleDateString()}
                        </span>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          fontSize: '0.8rem', 
                          color: checkedCount === totalCount ? 'var(--success-color)' : 'var(--warning-color)',
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: checkedCount === totalCount ? 'var(--success-color)' : 'var(--warning-color)',
                          color: 'white',
                          borderRadius: '4px'
                        }}>
                          {checkedCount === totalCount ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {checkedCount}/{totalCount} items
                        </span>
                      </div>
                      
                      {linkedTask && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--primary-color)',
                          marginBottom: '0.5rem'
                        }}>
                          📋 Linked to: {linkedTask.task_list}
                        </div>
                      )}
                    </div>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteShoppingList(list.id)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {list.items_json.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '1rem',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        opacity: item.checked ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                      }}>
                        {/* Checkbox */}
                        <button
                          onClick={() => updateItemChecked(list.id, index, !item.checked)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            color: item.checked ? 'var(--success-color)' : 'var(--secondary-color)',
                            transition: 'all 0.2s ease',
                            marginTop: '0.25rem'
                          }}
                        >
                          {item.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>

                        {/* Item Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? 'var(--secondary-color)' : 'var(--text-color)',
                            fontWeight: '500',
                            marginBottom: '0.5rem'
                          }}>
                            {item.name}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                            {/* Grainger Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Package size={12} style={{ color: 'var(--primary-color)' }} />
                              <span style={{ color: 'var(--secondary-color)' }}>Grainger:</span>
                              <span style={{ fontWeight: '500' }}>{item.grainger_part}</span>
                              {item.grainger_url && (
                                <a 
                                  href={item.grainger_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            
                            {/* Home Depot Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <MapPin size={12} style={{ color: 'var(--primary-color)' }} />
                              <span style={{ color: 'var(--secondary-color)' }}>Home Depot:</span>
                              <span style={{ fontWeight: '500' }}>{item.home_depot_aisle}</span>
                              {item.home_depot_url && (
                                <a 
                                  href={item.home_depot_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            
                            {/* Alternatives */}
                            {item.alternatives && item.alternatives.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={12} style={{ color: 'var(--secondary-color)' }} />
                                <span style={{ color: 'var(--secondary-color)' }}>Alternatives:</span>
                                <span style={{ fontSize: '0.75rem' }}>{item.alternatives.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Shopping 