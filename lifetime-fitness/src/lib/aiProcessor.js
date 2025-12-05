import { supabase } from './supabase'

// Secure AI processing through Supabase Edge Functions
export const aiProcessor = {
  // Parse shopping list items
  async parseShopping(input) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-processor', {
        body: {
          action: 'parse_shopping',
          data: input
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Shopping parsing error:', error)
      // Fallback to basic parsing
      return this.fallbackShoppingParsing(input)
    }
  },

  // Generate task suggestions
  async generateTaskSuggestions(tasks) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-processor', {
        body: {
          action: 'generate_task_suggestions',
          data: tasks
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Task suggestions error:', error)
      return this.fallbackTaskSuggestions(tasks)
    }
  },

  // Generate email reply
  async generateEmailReply(emailContent, tasks) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-processor', {
        body: {
          action: 'generate_email_reply',
          data: { emailContent, tasks }
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Email reply error:', error)
      return this.fallbackEmailReply(emailContent, tasks)
    }
  },

  // Analyze photo
  async analyzePhoto(description, tags) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-processor', {
        body: {
          action: 'analyze_photo',
          data: { description, tags }
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Photo analysis error:', error)
      return this.fallbackPhotoAnalysis(description, tags)
    }
  },

  // Search knowledge base
  async searchKnowledge(query, knowledgeBase) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-processor', {
        body: {
          action: 'search_knowledge',
          data: { query, knowledgeBase }
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Knowledge search error:', error)
      return this.fallbackKnowledgeSearch(query, knowledgeBase)
    }
  },

  // Fallback functions when AI is not available
  fallbackShoppingParsing(input) {
    // Basic regex-based parsing
    const items = input.split(/[,\n]/).filter(item => item.trim())
    return items.map(item => ({
      name: item.trim(),
      quantity: 1,
      brand: 'N/A',
      grainger_part: 'N/A',
      grainger_url: 'N/A',
      home_depot_aisle: 'N/A'
    }))
  },

  fallbackTaskSuggestions(tasks) {
    const suggestions = [
      {
        suggestion: 'Prioritize high-priority tasks first',
        impact: 'High - Reduces risk and improves efficiency'
      },
      {
        suggestion: 'Group similar tasks together',
        impact: 'Medium - Saves time and reduces context switching'
      },
      {
        suggestion: 'Set realistic deadlines for each task',
        impact: 'Medium - Improves planning and accountability'
      }
    ]
    return suggestions
  },

  fallbackEmailReply(emailContent, tasks) {
    const taskSummary = tasks.length > 0 
      ? `I'm currently working on ${tasks.length} maintenance tasks. `
      : ''
    
    return `Thank you for your email regarding: "${emailContent}"

${taskSummary}I'll review this and get back to you with a detailed response shortly.

Best regards,
Maintenance Team`
  },

  fallbackPhotoAnalysis(description, tags) {
    return [
      {
        suggestion: 'Add more descriptive tags for better searchability',
        impact: 'Medium - Improves photo organization'
      },
      {
        suggestion: 'Group photos by maintenance area or equipment type',
        impact: 'High - Makes it easier to find related photos'
      },
      {
        suggestion: 'Include date and location in photo descriptions',
        impact: 'Medium - Provides better context for future reference'
      }
    ]
  },

  fallbackKnowledgeSearch(query, knowledgeBase) {
    // Basic text search
    const searchTerm = query.toLowerCase()
    return knowledgeBase.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }
}

// Input validation functions
export const validateInput = {
  shopping(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Shopping input must be a non-empty string')
    }
    if (input.length > 1000) {
      throw new Error('Shopping input too long (max 1000 characters)')
    }
    return input.trim()
  },

  tasks(tasks) {
    if (!Array.isArray(tasks)) {
      throw new Error('Tasks must be an array')
    }
    if (tasks.length > 100) {
      throw new Error('Too many tasks (max 100)')
    }
    return tasks.filter(task => 
      task && 
      typeof task.description === 'string' && 
      task.description.trim().length > 0
    )
  },

  email(emailContent) {
    if (!emailContent || typeof emailContent !== 'string') {
      throw new Error('Email content must be a non-empty string')
    }
    if (emailContent.length > 5000) {
      throw new Error('Email content too long (max 5000 characters)')
    }
    return emailContent.trim()
  },

  photo(description, tags) {
    if (!description || typeof description !== 'string') {
      throw new Error('Photo description must be a non-empty string')
    }
    if (!Array.isArray(tags)) {
      throw new Error('Photo tags must be an array')
    }
    if (description.length > 500) {
      throw new Error('Photo description too long (max 500 characters)')
    }
    if (tags.length > 20) {
      throw new Error('Too many photo tags (max 20)')
    }
    return {
      description: description.trim(),
      tags: tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0)
    }
  },

  knowledge(query, knowledgeBase) {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a non-empty string')
    }
    if (!Array.isArray(knowledgeBase)) {
      throw new Error('Knowledge base must be an array')
    }
    if (query.length > 200) {
      throw new Error('Search query too long (max 200 characters)')
    }
    return {
      query: query.trim(),
      knowledgeBase: knowledgeBase.filter(item => 
        item && 
        typeof item.title === 'string' && 
        typeof item.content === 'string'
      )
    }
  }
} 