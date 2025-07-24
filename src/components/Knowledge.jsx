import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  BookOpen, 
  Search, 
  Brain,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  RotateCcw,
  Plus,
  Trash2,
  Filter,
  List,
  Grid,
  Zap,
  Tool,
  Package,
  Clock,
  User,
  Calendar,
  Star,
  Bookmark,
  Share2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Settings,
  HelpCircle,
  Info,
  Lightbulb,
  Wrench,
  Hammer,
  Screwdriver,
  Ladder,
  Safety,
  Warning
} from 'lucide-react'

const Knowledge = () => {
  console.log('Rendering Knowledge')
  const [knowledgeEntries, setKnowledgeEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [question, setQuestion] = useState('')
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEntries, setFilteredEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'

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

  // Load knowledge entries on component mount
  useEffect(() => {
    loadKnowledgeEntries()
  }, [])

  // Handle voice commands
  useEffect(() => {
    const voiceKnowledge = localStorage.getItem('voiceKnowledge')
    if (voiceKnowledge) {
      setQuestion(voiceKnowledge)
      localStorage.removeItem('voiceKnowledge')
      // Auto-process the voice knowledge search
      setTimeout(() => {
        processQuestion()
      }, 500)
    }
  }, [])

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(knowledgeEntries)
    } else {
      const filtered = knowledgeEntries.filter(entry => 
        entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.response.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
  }, [searchQuery, knowledgeEntries])

  const loadKnowledgeEntries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.KNOWLEDGE)
        .select('*')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKnowledgeEntries(data || [])
      setFilteredEntries(data || [])
      console.log('Knowledge entries loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading knowledge entries:', error)
      console.log('Knowledge component: Data load failed, showing fallback')
      showMessage('error', 'Failed to load knowledge entries')
      setKnowledgeEntries([]) // Ensure empty state for fallback
      setFilteredEntries([]) // Ensure empty filtered state for fallback
    } finally {
      setLoading(false)
    }
  }

  const processQuestion = async () => {
    if (!question.trim()) return

    try {
      setProcessing(true)
      const grokApiKey = API_KEYS.GROK_PRO

      if (!grokApiKey || grokApiKey === 'your-grok-key') {
        console.warn('Grok Pro API key not configured, using fallback response')
        // Fallback: simple response without API
        const fallbackResponse = `Steps to ${question}:
1. Gather necessary tools and supplies
2. Ensure safety measures are in place
3. Follow standard maintenance procedures
4. Test the completed work
5. Document any issues or notes

Tools needed: Basic maintenance tools
Supplies needed: Standard maintenance supplies
Time estimate: 1-2 hours
Difficulty: Moderate

Note: This is a fallback response. Configure Grok Pro API for detailed, specific guidance.`
        
        await saveKnowledgeEntry(question, fallbackResponse)
        return
      }

      console.log('Processing question with Grok Pro...')

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: `You are a professional maintenance expert for Lifetime Fitness facilities. Provide detailed, step-by-step instructions for maintenance and repair tasks. Always include:
1. Safety considerations
2. Required tools (specific tool names)
3. Required supplies (specific part numbers or descriptions)
4. Time estimates
5. Difficulty level
6. Step-by-step instructions
7. Troubleshooting tips

Format your response with clear sections and bullet points. Be specific and practical.`
            },
            {
              role: 'user',
              content: `Provide detailed maintenance instructions for: ${question}

Include:
- Safety considerations
- Required tools (be specific)
- Required supplies (be specific)
- Time estimate
- Difficulty level (Easy/Moderate/Difficult)
- Step-by-step instructions
- Troubleshooting tips

Format with clear sections and use bullet points for easy reading.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Grok API error:', response.status, errorText)
        throw new Error(`Grok API error: ${response.status}`)
      }

      const result = await response.json()
      const grokResponse = result.choices[0].message.content
      
      console.log('Grok response generated:', grokResponse)

      await saveKnowledgeEntry(question, grokResponse)

    } catch (error) {
      console.error('Error processing question:', error)
      showMessage('error', 'Failed to process question. Using fallback response.')
      
      // Fallback: simple response
      const fallbackResponse = `Steps to ${question}:
1. Gather necessary tools and supplies
2. Ensure safety measures are in place
3. Follow standard maintenance procedures
4. Test the completed work
5. Document any issues or notes

Tools needed: Basic maintenance tools
Supplies needed: Standard maintenance supplies
Time estimate: 1-2 hours
Difficulty: Moderate

Note: This is a fallback response. Configure Grok Pro API for detailed, specific guidance.`
      
      await saveKnowledgeEntry(question, fallbackResponse)
    } finally {
      setProcessing(false)
      setQuestion('')
    }
  }

  const saveKnowledgeEntry = async (questionText, responseText) => {
    try {
      const { error } = await supabase
        .from(TABLES.KNOWLEDGE)
        .insert({
          user_id: 'current-user',
          question: questionText,
          response: responseText,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      console.log('Knowledge entry saved successfully')
      showMessage('success', 'Knowledge entry created successfully')
      
      await loadKnowledgeEntries()
    } catch (error) {
      console.error('Error saving knowledge entry:', error)
      showMessage('error', 'Failed to save knowledge entry')
    }
  }

  const deleteKnowledgeEntry = async (entryId) => {
    try {
      const { error } = await supabase
        .from(TABLES.KNOWLEDGE)
        .delete()
        .eq('id', entryId)

      if (error) throw error

      setKnowledgeEntries(knowledgeEntries.filter(entry => entry.id !== entryId))
      setFilteredEntries(filteredEntries.filter(entry => entry.id !== entryId))
      console.log(`Knowledge entry ${entryId} deleted`)
      showMessage('success', 'Knowledge entry deleted')
    } catch (error) {
      console.error('Error deleting knowledge entry:', error)
      showMessage('error', 'Failed to delete knowledge entry')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showMessage('success', 'Copied to clipboard')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      showMessage('error', 'Failed to copy to clipboard')
    }
  }

  const formatResponse = (response) => {
    // Convert markdown-like formatting to HTML
    return response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/^- (.*)/gm, '• $1')
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'var(--success-color)'
      case 'moderate': return 'var(--warning-color)'
      case 'difficult': return 'var(--danger-color)'
      default: return 'var(--secondary-color)'
    }
  }

  const extractToolsAndSupplies = (response) => {
    const tools = []
    const supplies = []
    
    // Extract tools and supplies from response
    const lines = response.split('\n')
    lines.forEach(line => {
      if (line.toLowerCase().includes('tool') && !line.toLowerCase().includes('supply')) {
        tools.push(line.replace(/.*tool.*?:/i, '').trim())
      }
      if (line.toLowerCase().includes('supply')) {
        supplies.push(line.replace(/.*supply.*?:/i, '').trim())
      }
    })
    
    return { tools, supplies }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  return (
    <div className="container">
      {!isOnline && (
        <div className="offline-alert">
          ⚠️ You are currently offline. Knowledge search may not work properly.
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Knowledge Input Section */}
      <div className="card">
        <h3>Maintenance Knowledge Base</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Ask questions about maintenance procedures and get detailed, step-by-step instructions with tools and supplies.
        </p>
        
        <div className="form-group">
          <label className="form-label" htmlFor="knowledge-question">What maintenance question do you have?</label>
          <textarea
            id="knowledge-question"
            name="knowledge-question"
            className="form-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: How to change a light bulb, How to fix HVAC filter, How to repair concrete cracks"
            rows={3}
            disabled={processing}
          />
        </div>

        <button
          className="btn"
          onClick={processQuestion}
          disabled={!question.trim() || processing}
          title="Get maintenance knowledge"
          aria-label="Get maintenance knowledge"
        >
          {processing ? (
            <>
              <Loader size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
              Generating response...
            </>
          ) : (
            <>
              <Brain size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
              Get Knowledge
            </>
          )}
        </button>

        {/* Knowledge Features */}
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            <Lightbulb size={16} style={{ marginRight: '0.5rem' }} />
            Knowledge Features
          </h4>
          <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
            <div>• Step-by-step maintenance instructions</div>
            <div>• Required tools and supplies lists</div>
            <div>• Safety considerations and time estimates</div>
            <div>• Difficulty levels and troubleshooting tips</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Knowledge Library</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setViewMode('list')}
              style={{ 
                backgroundColor: viewMode === 'list' ? 'var(--primary-color)' : 'var(--secondary-color)',
                color: 'white'
              }}
              title="View as list"
              aria-label="View as list"
            >
              <List size={16} aria-hidden="true" />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setViewMode('grid')}
              style={{ 
                backgroundColor: viewMode === 'grid' ? 'var(--primary-color)' : 'var(--secondary-color)',
                color: 'white'
              }}
              title="View as grid"
              aria-label="View as grid"
            >
              <Grid size={16} aria-hidden="true" />
            </button>
            <button
              className="btn btn-secondary"
              onClick={loadKnowledgeEntries}
              disabled={loading}
              title="Refresh knowledge base"
              aria-label="Refresh knowledge base"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Search Knowledge</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions and responses..."
              style={{ flex: 1 }}
              title="Search knowledge base"
              aria-label="Search knowledge base"
            />
            <Search size={16} style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }} aria-hidden="true" />
          </div>
        </div>
        
        {loading && filteredEntries.length === 0 ? (
          <div className="loading">Loading knowledge entries...</div>
        ) : filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            {searchQuery ? 'No matching knowledge entries found.' : 'No knowledge entries yet. Ask a question above to get started!'}
          </p>
        ) : (
          <div style={{ 
            display: viewMode === 'grid' ? 'grid' : 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none'
          }}>
            {filteredEntries.map(entry => {
              const { tools, supplies } = extractToolsAndSupplies(entry.response)
              const difficulty = entry.response.match(/difficulty.*?:.*?(easy|moderate|difficult)/i)?.[1] || 'moderate'
              
              return (
                <div key={entry.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: 'var(--light-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 0.5rem 0', 
                        color: 'var(--primary-color)',
                        fontSize: '1rem'
                      }}>
                        <BookOpen size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                        {entry.question}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                        <Calendar size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                        {new Date(entry.created_at).toLocaleDateString()}
                        <span style={{ margin: '0 0.5rem' }}>•</span>
                        <span style={{ 
                          color: getDifficultyColor(difficulty),
                          fontWeight: '500'
                        }}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteKnowledgeEntry(entry.id)
                      }}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      title="Delete entry"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>

                  {/* Tools and Supplies Preview */}
                  {(tools.length > 0 || supplies.length > 0) && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      {tools.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          <Tool size={12} style={{ color: 'var(--primary-color)' }} aria-hidden="true" />
                          <span style={{ color: 'var(--secondary-color)' }}>Tools:</span>
                          <span style={{ fontSize: '0.75rem' }}>{tools.slice(0, 2).join(', ')}{tools.length > 2 ? '...' : ''}</span>
                        </div>
                      )}
                      {supplies.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                          <Package size={12} style={{ color: 'var(--primary-color)' }} aria-hidden="true" />
                          <span style={{ color: 'var(--secondary-color)' }}>Supplies:</span>
                          <span style={{ fontSize: '0.75rem' }}>{supplies.slice(0, 2).join(', ')}{supplies.length > 2 ? '...' : ''}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response Preview */}
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-color)',
                    lineHeight: '1.4',
                    maxHeight: selectedEntry?.id === entry.id ? 'none' : '3rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: selectedEntry?.id === entry.id ? 'none' : 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {selectedEntry?.id === entry.id ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: formatResponse(entry.response) }}
                        style={{ whiteSpace: 'pre-line' }}
                      />
                    ) : (
                      entry.response.substring(0, 150) + (entry.response.length > 150 ? '...' : '')
                    )}
                  </div>

                  {/* Action Buttons */}
                  {selectedEntry?.id === entry.id && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(entry.response)
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        title="Copy response"
                        aria-label="Copy response"
                      >
                        <Copy size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                        Copy
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(entry.question)
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        title="Copy question"
                        aria-label="Copy question"
                      >
                        <Copy size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                        Copy Question
                      </button>
                    </div>
                  )}
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

export default Knowledge 