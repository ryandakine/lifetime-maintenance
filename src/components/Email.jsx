import React, { useState, useEffect } from 'react'
import { supabase, TABLES, API_KEYS } from '../lib/supabase'
import { Send, MessageSquare, RotateCcw, Brain } from 'lucide-react'

const Email = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: ''
  })

  // Load emails on component mount
  useEffect(() => {
    loadEmails()
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
      showMessage('error', 'Failed to load emails')
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
      
      // Fetch task data from Supabase for context
      const { data: tasks, error: tasksError } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', 'current-user') // Replace with actual user ID
        .order('created_at', { ascending: false })
        .limit(10) // Get last 10 tasks for context

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

  const generateEmailResponseWithClaude = async (emailContext, tasksData) => {
    try {
      const claudeApiKey = API_KEYS.CLAUDE_API
      
      if (!claudeApiKey || claudeApiKey === 'your-claude-key') {
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
            <label className="form-label">To</label>
            <input
              type="email"
              className="form-input"
              value={emailForm.to}
              onChange={(e) => setEmailForm({...emailForm, to: e.target.value})}
              placeholder="recipient@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
              placeholder="Email subject"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Body</label>
            <textarea
              className="form-textarea"
              value={emailForm.body}
              onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
              placeholder="Email content..."
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <>
                <RotateCcw size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} style={{ marginRight: '0.5rem' }} />
                Send Email
              </>
            )}
          </button>
        </form>
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