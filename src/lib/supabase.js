import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('Supabase connected to:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Add error handling for supabase operations
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Supabase user signed in:', session?.user?.email)
  } else if (event === 'SIGNED_OUT') {
    console.log('Supabase user signed out')
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Supabase token refreshed')
  }
})

// Log connection errors
const originalFrom = supabase.from
supabase.from = (table) => {
  const query = originalFrom.call(supabase, table)
  const originalSelect = query.select
  query.select = (...args) => {
    const result = originalSelect.apply(query, args)
    result.then = (resolve, reject) => {
      return originalSelect.apply(query, args).then((data) => {
        if (data.error) {
          console.error(`Supabase error on table ${table}:`, data.error)
        }
        return resolve ? resolve(data) : data
      }, (error) => {
        console.error(`Supabase connection error on table ${table}:`, error)
        return reject ? reject(error) : Promise.reject(error)
      })
    }
    return result
  }
  return query
}

// Database schema helpers
export const TABLES = {
  TASKS: 'tasks',
  SHOPPING_LISTS: 'shopping_lists',
  EMAILS: 'emails',
  KNOWLEDGE: 'knowledge',
  PROJECTS: 'projects',
  PHOTOS: 'photos',
  // Off-days tables
  MONETARY_GOALS: 'monetary_goals',
  GOALS: 'goals',
  WORKOUTS: 'workouts',
  SPIRITUAL: 'spiritual'
}

// Task status constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

// API Keys (placeholder - replace with actual keys)
export const API_KEYS = {
  PERPLEXITY_API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY || 'your-perplexity-key',
  CLAUDE_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY || 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  ANTHROPIC: import.meta.env.VITE_ANTHROPIC_API_KEY || 'your-anthropic-key',
  GROK_API_KEY: import.meta.env.VITE_GROK_API_KEY || 'your-grok-key',
  RESEND: import.meta.env.VITE_RESEND_API_KEY || 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN || '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'
} 