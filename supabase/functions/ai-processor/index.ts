import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, data } = await req.json()
    
    // Get API keys from environment variables
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }

    switch (action) {
      case 'parse_shopping':
        return await handleShoppingParsing(data, perplexityApiKey)
      case 'generate_task_suggestions':
        return await handleTaskSuggestions(data, perplexityApiKey)
      case 'generate_email_reply':
        return await handleEmailReply(data, perplexityApiKey)
      case 'analyze_photo':
        return await handlePhotoAnalysis(data, perplexityApiKey)
      case 'search_knowledge':
        return await handleKnowledgeSearch(data, perplexityApiKey)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('AI Processor Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleShoppingParsing(input: string, apiKey: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Parse the following shopping list and return it in a JSON array of objects. Each object should have 'name', 'quantity', 'brand', 'grainger_part', 'grainger_url', 'home_depot_aisle'. If a part number or URL is not available, set it to 'N/A'. Input: ${input}`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const result = await response.json()
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: JSON.parse(result.choices[0].message.content) 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleTaskSuggestions(tasks: any[], apiKey: string) {
  const taskSummary = tasks.map(t => `${t.description} (${t.priority} priority, ${t.category})`).join(', ')
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Analyze this maintenance task list and provide 3-5 productivity suggestions: ${taskSummary}. Return as JSON array with 'suggestion' and 'impact' fields.`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const result = await response.json()
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: JSON.parse(result.choices[0].message.content) 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleEmailReply({ emailContent, tasks }: any, apiKey: string) {
  const taskContext = tasks.map((t: any) => `${t.description} (${t.priority})`).join(', ')
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Generate a professional email reply to: "${emailContent}". Consider these current maintenance tasks: ${taskContext}. Return only the email body text.`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const result = await response.json()
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: result.choices[0].message.content 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handlePhotoAnalysis({ description, tags }: any, apiKey: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Analyze this photo description: "${description}" with tags: ${tags.join(', ')}. Provide 3 suggestions for better organization or workflow improvements. Return as JSON array.`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const result = await response.json()
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: JSON.parse(result.choices[0].message.content) 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleKnowledgeSearch({ query, knowledgeBase }: any, apiKey: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Search through this knowledge base for: "${query}". Knowledge base: ${JSON.stringify(knowledgeBase)}. Return relevant entries as JSON array.`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const result = await response.json()
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: JSON.parse(result.choices[0].message.content) 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
} 