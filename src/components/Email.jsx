import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { 
  Send, 
  MessageSquare, 
  RotateCcw, 
  Brain, 
  Copy, 
  FileText,
  Mic,
  Square,
  Mail,
  Users,
  Clock,
  Star,
  Trash2,
  Archive,
  Reply,
  Forward,
  Edit,
  Save,
  X
} from 'lucide-react'

const Email = () => {
  console.log('Rendering Email')
  console.log('Email rendering!')
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: ''
  })

  // Email context state for replies
  const [emailContext, setEmailContext] = useState({
    pastedContent: '',
    generatedReply: '',
    showContextForm: false
  })

  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [listeningTimeout, setListeningTimeout] = useState(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceModalText, setVoiceModalText] = useState('')
  const [voiceModalListening, setVoiceModalListening] = useState(false)
  const [voiceModalRecognitionRef, setVoiceModalRecognitionRef] = useState(null)
  const [voiceMode, setVoiceMode] = useState('body') // 'body', 'subject', 'to'

  // AI features state
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [emailTemplates, setEmailTemplates] = useState([])
  const [showTemplates, setShowTemplates] = useState(false)

  // Load emails on component mount
  useEffect(() => {
    loadEmails()
  }, [])

  // Handle voice commands
  useEffect(() => {
    const voiceEmail = localStorage.getItem('voiceEmail')
    if (voiceEmail) {
      try {
        const emailData = JSON.parse(voiceEmail)
        if (emailData.recipient) {
          setEmailForm(prev => ({ ...prev, recipient: emailData.recipient }))
        }
        if (emailData.subject) {
          setEmailForm(prev => ({ ...prev, subject: emailData.subject }))
        }
        localStorage.removeItem('voiceEmail')
      } catch (error) {
        console.error('Error parsing voice email data:', error)
        localStorage.removeItem('voiceEmail')
      }
    }
  }, [])

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAILS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmails(data || [])
    } catch (error) {
      console.error('Error loading emails:', error)
      console.log('Email component: Data load failed, showing fallback')
      showMessage('error', 'Failed to load emails')
      setEmails([]) // Ensure empty state for fallback
    }
  }

  const sendEmail = async (e) => {
    e.preventDefault()
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      showMessage('error', 'Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      
      // Call Supabase Function to send email via Resend
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailForm.to,
          subject: emailForm.subject,
          text: emailForm.body
        }
      })

      if (error) throw error

      // Save email to database
      const { data: emailData, error: dbError } = await supabase
        .from(TABLES.EMAILS)
        .insert([{
          user_id: 'current-user', // Replace with actual user ID
          to_email: emailForm.to,
          subject: emailForm.subject,
          body: emailForm.body,
          sent: true
        }])
        .select()

      if (dbError) throw dbError

      // Update local state
      setEmails([emailData[0], ...emails])
      setEmailForm({ to: '', subject: '', body: '' })
      
      // Log success
      console.log(`Email sent to ${emailForm.to}`)
      showMessage('success', `Email sent successfully to ${emailForm.to}`)
      
    } catch (error) {
      console.error('Error sending email:', error)
      showMessage('error', 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  const respondToEmail = async (emailId, context) => {
    try {
      setLoading(true)
      
      // Fetch task data from Supabase for context (limit to 5 for token optimization)
      const { data: tasks, error: tasksError } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', 'current-user') // Replace with actual user ID
        .order('created_at', { ascending: false })
        .limit(5) // Reduced to 5 tasks for token optimization

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        showMessage('error', 'Failed to fetch task data')
        return
      }

      console.log('Fetched tasks for Claude context:', tasks)

      // Generate response using Claude 4.0 Max API with task context
      const response = await generateEmailResponseWithClaude(context, tasks)
      
      // Send the response email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: context.to_email || 'sender@example.com',
          subject: `Re: ${context.subject}`,
          text: response
        }
      })

      if (error) throw error

      // Save response to database
      const { data: emailData, error: dbError } = await supabase
        .from(TABLES.EMAILS)
        .insert([{
          user_id: 'current-user',
          to_email: context.to_email || 'sender@example.com',
          subject: `Re: ${context.subject}`,
          body: response,
          sent: true
        }])
        .select()

      if (dbError) throw dbError

      setEmails([emailData[0], ...emails])
      console.log(`Response sent to ${context.to_email || 'sender@example.com'}`)
      showMessage('success', 'Response sent successfully')
      
    } catch (error) {
      console.error('Error sending response:', error)
      showMessage('error', 'Failed to send response')
    } finally {
      setLoading(false)
    }
  }

  const generateReplyWithContext = async () => {
    if (!emailContext.pastedContent.trim()) {
      showMessage('error', 'Please paste email content first')
      return
    }

    try {
      setLoading(true)
      
      // Fetch task data from Supabase for context (limit to 5 for token optimization)
      const { data: tasks, error: tasksError } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', 'current-user') // Replace with actual user ID
        .order('created_at', { ascending: false })
        .limit(5) // Reduced to 5 tasks for token optimization

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        showMessage('error', 'Failed to fetch task data')
        return
      }

      console.log('Fetched tasks for context reply:', tasks)

      // Generate reply using Claude with pasted content and tasks
      const reply = await generateContextualReply(emailContext.pastedContent, tasks)
      
      setEmailContext(prev => ({ ...prev, generatedReply: reply }))
      console.log('Reply generated with context')
      showMessage('success', 'Reply generated successfully')
      
    } catch (error) {
      console.error('Error generating reply:', error)
      showMessage('error', 'Failed to generate reply')
    } finally {
      setLoading(false)
    }
  }

  const sendGeneratedReply = async () => {
    if (!emailContext.generatedReply.trim()) {
      showMessage('error', 'Please generate a reply first')
      return
    }

    try {
      setLoading(true)
      
      // Extract recipient from pasted content or use default
      const recipient = extractRecipientFromContent(emailContext.pastedContent) || 'recipient@example.com'
      const subject = extractSubjectFromContent(emailContext.pastedContent) || 'Re: Maintenance Update'
      
      // Send the generated reply
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient,
          subject: subject,
          text: emailContext.generatedReply
        }
      })

      if (error) throw error

      // Save reply to database
      const { data: emailData, error: dbError } = await supabase
        .from(TABLES.EMAILS)
        .insert([{
          user_id: 'current-user',
          to_email: recipient,
          subject: subject,
          body: emailContext.generatedReply,
          sent: true
        }])
        .select()

      if (dbError) throw dbError

      setEmails([emailData[0], ...emails])
      console.log(`Generated reply sent to ${recipient}`)
      showMessage('success', 'Reply sent successfully')
      
      // Reset context form
      setEmailContext({
        pastedContent: '',
        generatedReply: '',
        showContextForm: false
      })
      
    } catch (error) {
      console.error('Error sending generated reply:', error)
      showMessage('error', 'Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  const generateContextualReply = async (pastedContent, tasksData) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Claude API key not configured, using fallback response')
        return generateFallbackContextualReply(pastedContent, tasksData)
      }

      // Prepare task context for Claude (optimized for token usage)
      const tasksContext = tasksData.map(task => 
        `- ${task.task_list} (${task.status})`
      ).join('\n')

      const prompt = `Generate a professional email reply based on this context:

Original Email:
${pastedContent}

Current Maintenance Tasks (last 5):
${tasksContext}

Instructions:
1. Create a concise, professional reply
2. Reference relevant maintenance tasks when applicable
3. Ask for specific updates if mentioned (e.g., windscreen, concrete project)
4. Keep response under 150 words
5. Use professional tone

Reply:`

      console.log('Sending contextual reply request to Claude API...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 500, // Reduced for token optimization
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
      const generatedReply = result.content[0].text

      console.log('Contextual reply generated successfully')
      return generatedReply

    } catch (error) {
      console.error('Error calling Claude API:', error)
      console.log('Using fallback contextual reply due to Claude API error')
      return generateFallbackContextualReply(pastedContent, tasksData)
    }
  }

  const generateFallbackContextualReply = (pastedContent, tasksData) => {
    // Fallback response when Claude API is not available
    const taskSummary = tasksData.length > 0 
      ? `\n\nCurrent maintenance status: ${tasksData.length} active tasks.`
      : '\n\nNo active maintenance tasks at this time.'

    return `Thank you for your email.

I have reviewed your message and will address your concerns promptly.${taskSummary}

I'll follow up with you shortly with more detailed information.

Best regards,
Maintenance Team`
  }

  const extractRecipientFromContent = (content) => {
    // Simple extraction - look for email patterns
    const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    return emailMatch ? emailMatch[0] : null
  }

  const extractSubjectFromContent = (content) => {
    // Simple extraction - look for subject line
    const subjectMatch = content.match(/Subject:\s*(.+)/i)
    return subjectMatch ? `Re: ${subjectMatch[1]}` : null
  }

  const generateEmailResponseWithClaude = async (emailContext, tasksData) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Claude API key not configured, using fallback response')
        return generateFallbackResponse(emailContext, tasksData)
      }

      // Prepare task context for Claude
      const tasksContext = tasksData.map(task => 
        `- ${task.task_list} (Status: ${task.status}, Due: ${task.due_date || 'No due date'})`
      ).join('\n')

      const prompt = `You are a professional maintenance team member at Lifetime Fitness. Generate a professional email response based on the following context:

Original Email Subject: ${emailContext.subject}
Original Email Body: ${emailContext.body}

Current Maintenance Tasks:
${tasksContext}

Please generate a professional, helpful response that:
1. Addresses the original email appropriately
2. References relevant maintenance tasks when applicable
3. Maintains a professional tone
4. Provides clear next steps or information
5. Is concise but comprehensive

Response:`

      console.log('Sending request to Claude API with context...')

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
      const generatedResponse = result.content[0].text

      console.log('Claude response generated successfully')
      return generatedResponse

    } catch (error) {
      console.error('Error calling Claude API:', error)
      console.log('Using fallback response due to Claude API error')
      return generateFallbackResponse(emailContext, tasksData)
    }
  }

  const generateFallbackResponse = (emailContext, tasksData) => {
    // Fallback response when Claude API is not available
    const taskSummary = tasksData.length > 0 
      ? `\n\nCurrent maintenance status: ${tasksData.length} active tasks, including ${tasksData.filter(t => t.status === 'pending').length} pending items.`
      : '\n\nNo active maintenance tasks at this time.'

    return `Thank you for your email regarding "${emailContext.subject}".

I have reviewed your message and will address your concerns promptly.${taskSummary}

I'll follow up with you shortly with more detailed information.

Best regards,
Maintenance Team`
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Voice Input Functions
  const startListening = (mode = 'body') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showMessage('error', 'Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setVoiceMode(mode)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript)
        // Apply to appropriate field based on mode
        if (mode === 'to') {
          setEmailForm(prev => ({ ...prev, to: finalTranscript }))
        } else if (mode === 'subject') {
          setEmailForm(prev => ({ ...prev, subject: finalTranscript }))
        } else {
          setEmailForm(prev => ({ ...prev, body: prev.body + ' ' + finalTranscript }))
        }
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    // Auto-stop after 30 seconds
    const timeout = setTimeout(() => {
      recognition.stop()
      recognition.abort()
    }, 30000)
    setListeningTimeout(timeout)

    recognition.start()
  }

  const stopListening = () => {
    if (listeningTimeout) {
      clearTimeout(listeningTimeout)
      setListeningTimeout(null)
    }
    try {
      // Stop any active recognition
      if (window.speechRecognition) {
        window.speechRecognition.stop()
        window.speechRecognition.abort()
      }
    } catch (error) {
      console.log('Recognition already stopped')
    }
    
    setIsListening(false)
    showMessage('info', 'Voice input stopped.')
  }

  // Voice Modal Functions
  const openVoiceModal = (mode = 'body') => {
    setShowVoiceModal(true)
    setVoiceModalText('')
    setVoiceMode(mode)
  }

  const closeVoiceModal = () => {
    setShowVoiceModal(false)
    setVoiceModalText('')
    if (voiceModalRecognitionRef) {
      voiceModalRecognitionRef.stop()
      voiceModalRecognitionRef.abort()
    }
  }

  const startVoiceModalListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showMessage('error', 'Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setVoiceModalListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setVoiceModalText(prev => prev + finalTranscript + ' ')
      }
    }

    recognition.onend = () => {
      setVoiceModalListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setVoiceModalListening(false)
    }

    recognition.start()
    setVoiceModalRecognitionRef(recognition)
  }

  const stopVoiceModalListening = () => {
    if (voiceModalRecognitionRef) {
      voiceModalRecognitionRef.stop()
      voiceModalRecognitionRef.abort()
      setVoiceModalListening(false)
    }
  }

  const applyVoiceModalText = () => {
    if (voiceModalText.trim()) {
      if (voiceMode === 'to') {
        setEmailForm(prev => ({ ...prev, to: voiceModalText.trim() }))
      } else if (voiceMode === 'subject') {
        setEmailForm(prev => ({ ...prev, subject: voiceModalText.trim() }))
      } else {
        setEmailForm(prev => ({ ...prev, body: voiceModalText.trim() }))
      }
      closeVoiceModal()
    }
  }

  // Email Templates
  const emailTemplatesList = [
    {
      name: 'Maintenance Report',
      subject: 'Maintenance Report - {{date}}',
      body: 'Dear {{recipient}},\n\nPlease find below the maintenance report for {{date}}:\n\n{{content}}\n\nBest regards,\n{{sender}}'
    },
    {
      name: 'Equipment Issue',
      subject: 'Equipment Issue Report - {{equipment}}',
      body: 'Dear {{recipient}},\n\nI am reporting an issue with {{equipment}}:\n\nIssue: {{issue}}\nLocation: {{location}}\nPriority: {{priority}}\n\nPlease advise on next steps.\n\nBest regards,\n{{sender}}'
    },
    {
      name: 'Work Order Request',
      subject: 'Work Order Request - {{project}}',
      body: 'Dear {{recipient}},\n\nI am requesting a work order for the following project:\n\nProject: {{project}}\nDescription: {{description}}\nEstimated Time: {{time}}\nMaterials Needed: {{materials}}\n\nPlease review and approve.\n\nBest regards,\n{{sender}}'
    },
    {
      name: 'Safety Concern',
      subject: 'Safety Concern Report',
      body: 'Dear {{recipient}},\n\nI am reporting a safety concern:\n\nIssue: {{issue}}\nLocation: {{location}}\nSeverity: {{severity}}\nImmediate Action Required: {{action}}\n\nPlease address as soon as possible.\n\nBest regards,\n{{sender}}'
    }
  ]

  const applyEmailTemplate = (template) => {
    const today = new Date().toLocaleDateString()
    const processedSubject = template.subject.replace('{{date}}', today)
    const processedBody = template.body
      .replace('{{date}}', today)
      .replace('{{sender}}', 'Maintenance Team')
    
    setEmailForm(prev => ({
      ...prev,
      subject: processedSubject,
      body: processedBody
    }))
    setShowTemplates(false)
  }

  // AI Suggestions
  const generateAiSuggestions = async () => {
    try {
      const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY
      if (!perplexityApiKey) {
        console.log('Perplexity API key not configured')
        return
      }

      const emailSummary = emails.map(email => ({
        to: email.to_email,
        subject: email.subject,
        body: email.body,
        sent: email.sent,
        created_at: email.created_at
      }))

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Analyze this email history and provide 3-5 suggestions for improving email communication, templates, or workflow. Return as JSON array with 'suggestion' and 'reason' fields. Emails: ${JSON.stringify(emailSummary)}`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const messageContent = data.choices[0].message.content
        const suggestions = JSON.parse(messageContent)
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    }
  }

  return (
    <div className="container">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h3>Send Email</h3>
        <form onSubmit={sendEmail}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-recipient">Recipient</label>
            <input
              id="email-recipient"
              name="email-recipient"
              type="email"
              className="form-input"
              value={emailForm.recipient}
              onChange={(e) => setEmailForm({...emailForm, recipient: e.target.value})}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email-subject">Subject</label>
            <input
              id="email-subject"
              name="email-subject"
              type="text"
              className="form-input"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
              placeholder="Enter email subject"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email-body">Body</label>
            <textarea
              id="email-body"
              name="email-body"
              className="form-textarea"
              value={emailForm.body}
              onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
              placeholder="Email content..."
              title="Email body content"
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading} title="Send email" aria-label="Send email">
            {loading ? (
              <>
                <RotateCcw size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                Send Email
              </>
            )}
          </button>
        </form>

        {/* Voice Input Section */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: isListening ? 'var(--warning-color)' : 'var(--light-color)', 
          borderRadius: '8px',
          border: isListening ? '2px solid var(--warning-color)' : '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <h4 style={{ 
            marginBottom: '0.5rem', 
            color: isListening ? 'white' : 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Mic size={20} />
            Voice Input
          </h4>
          
          {/* Voice Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => startListening('to')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: isListening && voiceMode === 'to' ? '#dc3545' : 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Users size={16} />
              To
            </button>
            
            <button
              onClick={() => startListening('subject')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: isListening && voiceMode === 'subject' ? '#dc3545' : 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <FileText size={16} />
              Subject
            </button>
            
            <button
              onClick={() => startListening('body')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: isListening && voiceMode === 'body' ? '#dc3545' : 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <MessageSquare size={16} />
              Body
            </button>
            
            <button
              onClick={openVoiceModal}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '25px',
                border: '2px solid var(--primary-color)',
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Mic size={16} />
              Modal
            </button>
          </div>
          
          {/* Voice Status */}
          {isListening && (
            <div style={{ 
              color: 'white', 
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              🎤 LISTENING - Click button to stop
            </div>
          )}
          
          {/* Voice Transcript */}
          {transcript && (
            <div style={{ 
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: 'var(--text-color)',
              minHeight: '40px'
            }}>
              <strong>You said:</strong> {transcript}
            </div>
          )}
        </div>

        {/* Email Templates */}
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>📧 Email Templates</h4>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: showTemplates ? 'var(--primary-color)' : 'white',
                color: showTemplates ? 'white' : 'var(--text-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FileText size={16} />
              {showTemplates ? 'Hide Templates' : 'Show Templates'}
            </button>
          </div>
          
          {showTemplates && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {emailTemplatesList.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyEmailTemplate(template)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'white',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{template.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                    {template.subject}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>🤖 AI Email Suggestions</h4>
            <button
              onClick={generateAiSuggestions}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Brain size={16} />
              Get AI Suggestions
            </button>
          </div>
          
          {aiSuggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} style={{ 
                  padding: '0.75rem', 
                  backgroundColor: 'white', 
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{suggestion.suggestion}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{suggestion.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Modal */}
      {showVoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>🎤 Voice Email Input</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Mode: {voiceMode}</label>
              </div>
              <textarea
                value={voiceModalText}
                onChange={(e) => setVoiceModalText(e.target.value)}
                placeholder="Your voice input will appear here..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={voiceModalListening ? stopVoiceModalListening : startVoiceModalListening}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: voiceModalListening ? '#dc3545' : 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {voiceModalListening ? <Square size={16} /> : <Mic size={16} />}
                {voiceModalListening ? 'Stop' : 'Start'} Recording
              </button>
              
              <button
                onClick={applyVoiceModalText}
                disabled={!voiceModalText.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: voiceModalText.trim() ? 'var(--success-color)' : 'var(--secondary-color)',
                  color: 'white',
                  cursor: voiceModalText.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Apply
              </button>
              
              <button
                onClick={closeVoiceModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  color: 'var(--text-color)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Context Reply Section */}
      <div className="card">
        <h3>Generate Reply with Context</h3>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
          Paste email content to generate a contextual reply using AI and your maintenance tasks.
        </p>
        
        <div className="form-group">
          <label className="form-label" htmlFor="paste-email-content">Paste Email Content</label>
          <textarea
            id="paste-email-content"
            name="paste-email-content"
            className="form-textarea"
            value={emailContext.pastedContent}
            onChange={(e) => setEmailContext({...emailContext, pastedContent: e.target.value})}
            placeholder="Paste the email content here (e.g., from Split Rail Fencing)..."
            rows={6}
            title="Paste email content to generate contextual reply"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            className="btn"
            onClick={generateReplyWithContext}
            disabled={loading || !emailContext.pastedContent.trim()}
            title="Generate AI reply with context"
            aria-label="Generate AI reply with context"
          >
            {loading ? (
              <>
                <Brain size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>
                <Brain size={16} style={{ marginRight: '0.5rem' }} aria-hidden="true" />
                Generate Reply
              </>
            )}
          </button>
        </div>

        {emailContext.generatedReply && (
          <div className="form-group">
            <label className="form-label">Generated Reply</label>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--light-color)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              marginBottom: '1rem'
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {emailContext.generatedReply}
              </div>
            </div>
            <button
              className="btn btn-success"
              onClick={sendGeneratedReply}
              disabled={loading}
            >
              <Send size={16} style={{ marginRight: '0.5rem' }} />
              Send Reply
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Email History</h3>
        {emails.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
            No emails sent yet
          </p>
        ) : (
          emails.map(email => (
            <div key={email.id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h4>{email.subject}</h4>
                  <p><strong>To:</strong> {email.to_email}</p>
                  <p><strong>Date:</strong> {new Date(email.created_at).toLocaleString()}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: email.sent ? 'var(--success-color)' : 'var(--warning-color)',
                      fontWeight: '600',
                      marginLeft: '0.5rem'
                    }}>
                      {email.sent ? 'Sent' : 'Draft'}
                    </span>
                  </p>
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    backgroundColor: 'var(--light-color)', 
                    borderRadius: 'var(--border-radius)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {email.body}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => respondToEmail(email.id, email)}
                  disabled={loading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {loading ? (
                    <>
                      <Brain size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                      AI Generating...
                    </>
                  ) : (
                    <>
                      <Brain size={16} style={{ marginRight: '0.5rem' }} />
                      AI Respond
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
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

export default Email 