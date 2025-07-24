import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  ShoppingCart, 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Brain,
  Store,
  Package,
  MapPin,
  RefreshCw,
  Truck,
  Clock,
  Camera,
  Upload,
  Check,
  X
} from 'lucide-react'

const Shopping = () => {
  const [shoppingLists, setShoppingLists] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const [shoppingInput, setShoppingInput] = useState({
    userInput: '',
    linkedTaskId: '',
    storeAddress: '123 Main St, Denver, CO 80202' // Default store address
  })

  const [photoAnalysis, setPhotoAnalysis] = useState({
    photo: null,
    photoUrl: '',
    analysis: '',
    loading: false,
    showForm: false
  })

  const [gotItemInput, setGotItemInput] = useState({
    text: '',
    loading: false
  })

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
        .eq('user_id', 'current-user') // Replace with actual user ID
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const processShoppingInput = async (e) => {
    e.preventDefault()
    if (!shoppingInput.userInput.trim()) {
      showMessage('error', 'Please enter your shopping needs')
      return
    }

    try {
      setLoading(true)
      
      // Use Claude 4.0 Max API to parse shopping input with supplier prioritization
      const parsedItems = await parseShoppingWithClaude(shoppingInput.userInput)
      
      if (parsedItems.length === 0) {
        showMessage('error', 'No valid items found in input')
        return
      }

      // Create supplier priority structure
      const supplierPriority = {
        primary: 'Grainger',
        quickPickup: 'Home Depot',
        alternatives: ['Lowe\'s', 'Ace Hardware'],
        storeAddress: shoppingInput.storeAddress
      }

      // Save parsed shopping list to Supabase
      const { data, error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .insert({
          user_id: 'current-user', // Replace with actual user ID
          task_id: shoppingInput.linkedTaskId || null,
          items_json: parsedItems,
          supplier_priority_json: supplierPriority,
          status: 'pending',
          notes: shoppingInput.userInput,
          store_address: shoppingInput.storeAddress
        })
        .select()

      if (error) throw error

      // Update local state
      setShoppingLists([data, ...shoppingLists])
      setShoppingInput({ userInput: '', linkedTaskId: '', storeAddress: '123 Main St, Denver, CO 80202' })
      
      console.log(`Generated shopping list with Grainger priority: ${parsedItems.length} items`)
      showMessage('success', `Shopping list created with ${parsedItems.length} items (Grainger prioritized)`)
      
    } catch (error) {
      console.error('Error processing shopping list:', error)
      showMessage('error', 'Failed to process shopping list')
    } finally {
      setLoading(false)
    }
  }

  const parseShoppingWithClaude = async (userInput) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Claude API key not configured, using fallback parsing')
        return parseShoppingFallback(userInput)
      }

      const prompt = `Parse this maintenance shopping request into prioritized supplier options.

User Input: "${userInput}"

Store Address: ${shoppingInput.storeAddress}

Supplier Priority Rules:
1. ALWAYS prioritize Grainger first (mail delivery, professional parts)
2. If user mentions "Home Depot" specifically, mark as quick pickup option
3. Include Lowe's and Ace Hardware as alternatives
4. For Grainger: Provide estimated part numbers (G-XXXXX format)
5. For Home Depot: Provide aisle information for quick pickup
6. For Lowe's/Ace: Provide basic availability info

Instructions:
1. Break down the input into individual shopping items
2. For each item, create 4 supplier options in priority order
3. Return as JSON array with: name, quantity, suppliers array (Grainger, Home Depot, Lowe's, Ace)
4. Each supplier should have: name, partNumber (if applicable), aisle (if applicable), delivery, notes

Example output:
[
  {
    "name": "HVAC Filter",
    "quantity": "2",
    "suppliers": [
      {
        "name": "Grainger",
        "partNumber": "G-12345",
        "delivery": "Mail delivery (2-3 days)",
        "notes": "Professional grade, 16x20x1 inch"
      },
      {
        "name": "Home Depot",
        "aisle": "Aisle 12 - HVAC",
        "delivery": "Quick pickup - can't wait for mail",
        "notes": "Available today"
      },
      {
        "name": "Lowe's",
        "delivery": "Store pickup",
        "notes": "Check local availability"
      },
      {
        "name": "Ace Hardware",
        "delivery": "Local pickup",
        "notes": "Limited selection"
      }
    ]
  }
]

Shopping Items:`

      console.log('Sending prioritized shopping parsing request to Claude API...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude API error:', response.status, errorText)
        throw new Error(`Claude API error: ${response.status}`)
      }

      const result = await response.json()
      const responseText = result.content[0].text

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON found in Claude response, using fallback')
        return parseShoppingFallback(userInput)
      }

      const parsedItems = JSON.parse(jsonMatch[0])
      console.log('Prioritized shopping items parsed with Claude:', parsedItems)
      return parsedItems

    } catch (error) {
      console.error('Error calling Claude API:', error)
      console.log('Using fallback shopping parsing due to Claude API error')
      return parseShoppingFallback(userInput)
    }
  }

  const parseShoppingFallback = (userInput) => {
    // Fallback parsing when Claude API is not available
    const itemPhrases = userInput.split(/[,;]+/).map(phrase => phrase.trim()).filter(phrase => phrase.length > 0)
    
    return itemPhrases.map(phrase => ({
      name: phrase,
      quantity: '1',
      suppliers: [
        {
          name: 'Grainger',
          partNumber: 'G-XXXXX',
          delivery: 'Mail delivery (2-3 days)',
          notes: 'Professional parts'
        },
        {
          name: 'Home Depot',
          aisle: 'General',
          delivery: 'Quick pickup - can\'t wait for mail',
          notes: 'Available today'
        },
        {
          name: 'Lowe\'s',
          delivery: 'Store pickup',
          notes: 'Check local availability'
        },
        {
          name: 'Ace Hardware',
          delivery: 'Local pickup',
          notes: 'Limited selection'
        }
      ]
    }))
  }

  const updateItemStatus = async (listId, itemIndex, supplierIndex, isCompleted) => {
    try {
      const list = shoppingLists.find(l => l.id === listId)
      if (!list) return

      const updatedItems = [...list.items_json]
      if (!updatedItems[itemIndex].suppliers[supplierIndex]) {
        updatedItems[itemIndex].suppliers[supplierIndex] = {}
      }
      updatedItems[itemIndex].suppliers[supplierIndex].completed = isCompleted

      const { error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .update({ items_json: updatedItems })
        .eq('id', listId)

      if (error) throw error

      setShoppingLists(shoppingLists.map(l => 
        l.id === listId ? { ...l, items_json: updatedItems } : l
      ))
      
      console.log(`Shopping item ${itemIndex}, supplier ${supplierIndex} status updated to ${isCompleted ? 'completed' : 'pending'}`)
    } catch (error) {
      console.error('Error updating item status:', error)
      showMessage('error', 'Failed to update item status')
    }
  }

  const processGotItem = async (e) => {
    e.preventDefault()
    if (!gotItemInput.text.trim()) {
      showMessage('error', 'Please enter what you got')
      return
    }

    try {
      setGotItemInput({ ...gotItemInput, loading: true })
      
      // Parse the "got item" input with Claude
      const gotItems = await parseGotItemWithClaude(gotItemInput.text)
      
      if (gotItems.length === 0) {
        showMessage('error', 'No items found in your input')
        return
      }

      // Update all shopping lists with the got items
      let updatedCount = 0
      for (const list of shoppingLists) {
        const updatedItems = [...list.items_json]
        let listUpdated = false

        for (const gotItem of gotItems) {
          for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i]
            if (item.name.toLowerCase().includes(gotItem.toLowerCase()) || 
                gotItem.toLowerCase().includes(item.name.toLowerCase())) {
              
              // Mark all suppliers as completed for this item
              for (let j = 0; j < item.suppliers.length; j++) {
                if (!item.suppliers[j].completed) {
                  item.suppliers[j].completed = true
                  listUpdated = true
                }
              }
            }
          }
        }

        if (listUpdated) {
          const { error } = await supabase
            .from(TABLES.SHOPPING_LISTS)
            .update({ items_json: updatedItems })
            .eq('id', list.id)

          if (error) throw error
          updatedCount++
        }
      }

      // Reload shopping lists
      await loadShoppingLists()
      
      setGotItemInput({ text: '', loading: false })
      console.log(`Updated ${updatedCount} shopping lists with got items`)
      showMessage('success', `Marked ${gotItems.length} items as got`)
      
    } catch (error) {
      console.error('Error processing got items:', error)
      showMessage('error', 'Failed to update got items')
      setGotItemInput({ ...gotItemInput, loading: false })
    }
  }

  const parseGotItemWithClaude = async (userInput) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Claude API key not configured, using fallback parsing')
        return parseGotItemFallback(userInput)
      }

      const prompt = `Extract the items that were purchased/got from this input.

User Input: "${userInput}"

Instructions:
1. Identify the specific items that were purchased or obtained
2. Return as JSON array of item names
3. Focus on maintenance/repair items

Example outputs:
- "I got the HVAC filter and ladder" → ["HVAC filter", "ladder"]
- "Bought cement and light bulbs" → ["cement", "light bulbs"]
- "Got the electrical breaker" → ["electrical breaker"]

Items:`

      console.log('Sending got item parsing request to Claude API...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude API error:', response.status, errorText)
        throw new Error(`Claude API error: ${response.status}`)
      }

      const result = await response.json()
      const responseText = result.content[0].text

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON found in Claude response, using fallback')
        return parseGotItemFallback(userInput)
      }

      const parsedItems = JSON.parse(jsonMatch[0])
      console.log('Got items parsed with Claude:', parsedItems)
      return parsedItems

    } catch (error) {
      console.error('Error calling Claude API:', error)
      console.log('Using fallback got item parsing due to Claude API error')
      return parseGotItemFallback(userInput)
    }
  }

  const parseGotItemFallback = (userInput) => {
    // Fallback parsing when Claude API is not available
    const itemPhrases = userInput.split(/[,;]+/).map(phrase => phrase.trim()).filter(phrase => phrase.length > 0)
    return itemPhrases
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setPhotoAnalysis({ ...photoAnalysis, loading: true, photo: file })
      
      // Upload to Supabase Storage
      const fileName = `photos/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      setPhotoAnalysis({ ...photoAnalysis, photoUrl: publicUrl, photo: file })
      
      // Analyze photo with Claude Vision
      await analyzePhotoWithClaude(publicUrl)
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      showMessage('error', 'Failed to upload photo')
      setPhotoAnalysis({ ...photoAnalysis, loading: false, photo: null })
    }
  }

  const analyzePhotoWithClaude = async (photoUrl) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Claude API key not configured, using fallback analysis')
        setPhotoAnalysis({ 
          ...photoAnalysis, 
          analysis: 'Photo analysis requires Claude API key configuration.',
          loading: false 
        })
        return
      }

      const prompt = `Analyze this maintenance/repair photo and provide detailed fix advice.

Instructions:
1. Identify the issue or maintenance need
2. Provide step-by-step repair instructions
3. List required tools and supplies
4. Recommend Grainger part numbers (G-XXXXX format) and Home Depot aisle info
5. Include safety considerations
6. Estimate time and difficulty level

Format your response as:
## Issue Analysis
[Describe what you see]

## Repair Steps
1. [Step 1]
2. [Step 2]
...

## Required Tools & Supplies
- [Tool/Supply 1] - [Grainger Part # or Home Depot Aisle]
- [Tool/Supply 2] - [Grainger Part # or Home Depot Aisle]

## Safety Notes
[Safety considerations]

## Time Estimate
[Estimated time and difficulty]`

      console.log('Sending photo analysis request to Claude Vision API...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image',
                  source: {
                    type: 'url',
                    url: photoUrl
                  }
                }
              ]
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude Vision API error:', response.status, errorText)
        throw new Error(`Claude Vision API error: ${response.status}`)
      }

      const result = await response.json()
      const analysis = result.content[0].text

      // Save to Supabase photos table
      const { error: saveError } = await supabase
        .from('photos')
        .insert({
          user_id: 'current-user',
          photo_url: photoUrl,
          response: analysis,
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving photo analysis:', saveError)
      }

      setPhotoAnalysis({ 
        ...photoAnalysis, 
        analysis, 
        loading: false 
      })
      
      console.log('Photo analysis completed and saved')
      showMessage('success', 'Photo analyzed successfully')
      
    } catch (error) {
      console.error('Error analyzing photo:', error)
      showMessage('error', 'Failed to analyze photo')
      setPhotoAnalysis({ ...photoAnalysis, loading: false })
    }
  }

  const createTaskFromPhoto = async () => {
    if (!photoAnalysis.analysis) return

    try {
      // Extract task name from analysis
      const taskName = photoAnalysis.analysis.split('\n')[0].replace('## Issue Analysis', '').trim()
      
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert({
          user_id: 'current-user',
          task_list: `Fix from photo: ${taskName}`,
          project_id: 'photo-analysis',
          status: 'pending',
          notes: photoAnalysis.analysis
        })
        .select()

      if (error) throw error

      // Reload tasks
      await loadTasks()
      
      console.log('Task created from photo analysis')
      showMessage('success', 'Task created from photo analysis')
      
    } catch (error) {
      console.error('Error creating task from photo:', error)
      showMessage('error', 'Failed to create task from photo')
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

  const generateFromTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      setLoading(true)
      
      // Generate shopping list based on task with supplier prioritization
      const taskPrompt = `Generate a prioritized shopping list for this maintenance task: "${task.task_list}". Include necessary materials, tools, and supplies with Grainger as primary supplier.`
      
      const parsedItems = await parseShoppingWithClaude(taskPrompt)
      
      if (parsedItems.length === 0) {
        showMessage('error', 'No items found for this task')
        return
      }

      // Create supplier priority structure
      const supplierPriority = {
        primary: 'Grainger',
        quickPickup: 'Home Depot',
        alternatives: ['Lowe\'s', 'Ace Hardware'],
        storeAddress: shoppingInput.storeAddress
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from(TABLES.SHOPPING_LISTS)
        .insert({
          user_id: 'current-user',
          task_id: taskId,
          items_json: parsedItems,
          supplier_priority_json: supplierPriority,
          status: 'pending',
          notes: `Generated from task: ${task.task_list}`,
          store_address: shoppingInput.storeAddress
        })
        .select()

      if (error) throw error

      setShoppingLists([data, ...shoppingLists])
      console.log(`Shopping list generated from task with Grainger priority: ${task.task_list}`)
      showMessage('success', `Shopping list created from task (Grainger prioritized)`)
      
    } catch (error) {
      console.error('Error generating from task:', error)
      showMessage('error', 'Failed to generate shopping list from task')
    } finally {
      setLoading(false)
    }
  }

  const getSupplierIcon = (supplierName) => {
    switch (supplierName) {
      case 'Grainger':
        return <Truck size={14} style={{ color: '#007BFF' }} />
      case 'Home Depot':
        return <Clock size={14} style={{ color: '#FF6B35' }} />
      case 'Lowe\'s':
        return <Store size={14} style={{ color: '#004990' }} />
      case 'Ace Hardware':
        return <Package size={14} style={{ color: '#FF0000' }} />
      default:
        return <Store size={14} />
    }
  }

  const getSupplierColor = (supplierName) => {
    switch (supplierName) {
      case 'Grainger':
        return '#007BFF'
      case 'Home Depot':
        return '#FF6B35'
      case 'Lowe\'s':
        return '#004990'
      case 'Ace Hardware':
        return '#FF0000'
      default:
        return 'var(--secondary-color)'
    }
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

      {/* Photo Analysis Section */}
      <div className="card">
        <h3>Photo Fix Advice</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Upload a photo of a maintenance issue for AI-powered fix advice.
        </p>
        
        {!photoAnalysis.showForm ? (
          <button
            className="btn"
            onClick={() => setPhotoAnalysis({ ...photoAnalysis, showForm: true })}
          >
            <Camera size={16} style={{ marginRight: '0.5rem' }} />
            Upload Photo for Analysis
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPhotoAnalysis({ ...photoAnalysis, showForm: false })}
              >
                <X size={16} style={{ marginRight: '0.5rem' }} />
                Cancel
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="form-input"
                disabled={photoAnalysis.loading}
              />
            </div>

            {photoAnalysis.photo && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={URL.createObjectURL(photoAnalysis.photo)} 
                  alt="Uploaded" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                />
              </div>
            )}

            {photoAnalysis.loading && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Brain size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                Analyzing photo...
              </div>
            )}

            {photoAnalysis.analysis && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button
                    className="btn btn-outline"
                    onClick={createTaskFromPhoto}
                  >
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Create Task from Analysis
                  </button>
                </div>
                
                <div style={{ 
                  backgroundColor: 'var(--light-color)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  {photoAnalysis.analysis}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Got Item Update Section */}
      <div className="card">
        <h3>Update Got Items</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Tell me what items you got to update your shopping lists.
        </p>
        
        <form onSubmit={processGotItem}>
          <div className="form-group">
            <label className="form-label">What did you get?</label>
            <input
              type="text"
              className="form-input"
              value={gotItemInput.text}
              onChange={(e) => setGotItemInput({...gotItemInput, text: e.target.value})}
              placeholder="e.g., I got the HVAC filter and ladder"
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={gotItemInput.loading || !gotItemInput.text.trim()}
          >
            {gotItemInput.loading ? (
              <>
                <Brain size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <Check size={16} style={{ marginRight: '0.5rem' }} />
                Mark as Got
              </>
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Tell me your orders</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Describe your shopping needs and I'll create a prioritized list with Grainger as primary supplier.
        </p>
        
        <form onSubmit={processShoppingInput}>
          <div className="form-group">
            <label className="form-label">Shopping Description</label>
            <textarea
              className="form-textarea"
              value={shoppingInput.userInput}
              onChange={(e) => setShoppingInput({...shoppingInput, userInput: e.target.value})}
              placeholder="e.g., Need cement for concrete, ladder for light bulb, check Home Depot aisle..."
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Link to Task (optional)</label>
            <select
              className="form-input"
              value={shoppingInput.linkedTaskId}
              onChange={(e) => setShoppingInput({...shoppingInput, linkedTaskId: e.target.value})}
            >
              <option value="">Select a task...</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.task_list}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <input
              type="text"
              className="form-input"
              value={shoppingInput.storeAddress}
              onChange={(e) => setShoppingInput({...shoppingInput, storeAddress: e.target.value})}
              placeholder="Store address for aisle information"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              type="submit"
              className="btn"
              disabled={loading || !shoppingInput.userInput.trim()}
            >
              {loading ? (
                <>
                  <Brain size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <Plus size={16} style={{ marginRight: '0.5rem' }} />
                  Add to List
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadShoppingLists}
              disabled={loading}
            >
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              Refresh
            </button>
          </div>
        </form>
      </div>

      {/* Generate from Tasks */}
      {tasks.length > 0 && (
        <div className="card">
          <h3>Generate from Tasks</h3>
          <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
            Create prioritized shopping lists from your pending tasks (Grainger first).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tasks.map(task => (
              <button
                key={task.id}
                className="btn btn-outline"
                onClick={() => generateFromTask(task.id)}
                disabled={loading}
                style={{ fontSize: '0.9rem' }}
              >
                <Package size={14} style={{ marginRight: '0.5rem' }} />
                {task.task_list}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Shopping Lists (Grainger Prioritized)</h3>
        
        {loading && shoppingLists.length === 0 ? (
          <div className="loading">Loading shopping lists...</div>
        ) : shoppingLists.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No shopping lists yet. Add some items above to get started!
          </p>
        ) : (
          shoppingLists.map(list => {
            const totalItems = list.items_json?.length || 0
            const completedItems = list.items_json?.reduce((total, item) => {
              return total + (item.suppliers?.filter(s => s.completed)?.length || 0)
            }, 0)

            return (
              <div key={list.id} className="shopping-list-item" style={{ marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                      Shopping List ({completedItems} items completed)
                    </h4>
                    {list.notes && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                        {list.notes}
                      </p>
                    )}
                    {list.task_id && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--primary-color)' }}>
                        📋 Linked to task
                      </p>
                    )}
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--success-color)' }}>
                      🚚 Grainger prioritized for professional parts
                    </p>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteShoppingList(list.id)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {list.items_json?.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
                    <h5 style={{ margin: '0 0 1rem 0', color: 'var(--primary-color)' }}>
                      {item.name} {item.quantity && `(${item.quantity})`}
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {item.suppliers?.map((supplier, supplierIndex) => (
                        <div key={supplierIndex} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: supplier.completed ? 'var(--light-color)' : 'transparent',
                          borderRadius: '4px',
                          border: `2px solid ${getSupplierColor(supplier.name)}`,
                          opacity: supplier.completed ? 0.7 : 1
                        }}>
                          <input
                            type="checkbox"
                            className="task-checkbox"
                            checked={supplier.completed || false}
                            onChange={(e) => updateItemStatus(list.id, itemIndex, supplierIndex, e.target.checked)}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
                            {getSupplierIcon(supplier.name)}
                            <span style={{ 
                              fontWeight: '600',
                              color: getSupplierColor(supplier.name),
                              fontSize: '0.9rem'
                            }}>
                              {supplier.name}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '500',
                              textDecoration: supplier.completed ? 'line-through' : 'none',
                              marginBottom: '0.25rem'
                            }}>
                              {supplier.partNumber && `Part #: ${supplier.partNumber} • `}
                              {supplier.aisle && `Aisle: ${supplier.aisle} • `}
                              {supplier.delivery}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                              {supplier.notes}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })
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