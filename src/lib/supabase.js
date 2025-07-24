import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema helpers
export const TABLES = {
  TASKS: 'tasks',
  SHOPPING_LISTS: 'shopping_lists',
  EMAILS: 'emails',
  KNOWLEDGE: 'knowledge',
  PROJECTS: 'projects'
}

// Task status constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

// API Keys (placeholder - replace with actual keys)
export const API_KEYS = {
  PERPLEXITY_PRO: import.meta.env.VITE_PERPLEXITY_API_KEY || 'your-perplexity-key',
  CLAUDE_API: import.meta.env.VITE_ANTHROPIC_API_KEY || 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  GROK_PRO: import.meta.env.VITE_GROK_API_KEY || 'your-grok-key',
  RESEND: import.meta.env.VITE_RESEND_API_KEY || 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
} 