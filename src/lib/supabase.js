import { createClient } from '@supabase/supabase-js'

// ============================================================================
// CONFIGURATION VALIDATION - Fail Fast on Missing Environment Variables
// ============================================================================
// Instead of silently falling back to placeholder values, we validate that
// required environment variables are properly configured. This prevents
// production issues where the app runs with wrong configuration.
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate Supabase configuration
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  throw new Error(
    '❌ VITE_SUPABASE_URL is not configured.\n' +
    'Please set VITE_SUPABASE_URL in your .env file.\n' +
    'Example: VITE_SUPABASE_URL=https://your-project.supabase.co'
  )
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  throw new Error(
    '❌ VITE_SUPABASE_ANON_KEY is not configured.\n' +
    'Please set VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'Example: VITE_SUPABASE_ANON_KEY=your-anon-key-here'
  )
}

console.log('✅ Supabase connected to:', supabaseUrl)

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

// ============================================================================
// API KEYS - SECURITY FIX
// ============================================================================
// CRITICAL: Removed hard-coded API keys and GitHub tokens that were exposed
// in source code. All API keys must now be properly configured in .env file.
// No fallbacks to prevent accidental exposure of secrets.
// ============================================================================

export const API_KEYS = {
  PERPLEXITY_API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY,
  CLAUDE_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
  ANTHROPIC: import.meta.env.VITE_ANTHROPIC_API_KEY,
  GROK_API_KEY: import.meta.env.VITE_GROK_API_KEY,
  GROK_PRO: import.meta.env.VITE_GROK_API_KEY, // Alias for compatibility
  RESEND: import.meta.env.VITE_RESEND_API_KEY,
  GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN
  // ⚠️ IMPORTANT: The previously exposed GitHub token has been removed.
  // Please rotate your GitHub token and add it to .env file:
  // VITE_GITHUB_TOKEN=your_new_token_here
} 