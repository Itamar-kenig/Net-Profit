import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  || 'https://vwmcuhkwjvcxnnzndgac.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bWN1aGt3anZjeG5uem5kZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTQ1MDYsImV4cCI6MjA5MTM5MDUwNn0.4DYVIb5nhMa369iiFGKmrFbrgCUvCTFzYuntdzVNDu8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
