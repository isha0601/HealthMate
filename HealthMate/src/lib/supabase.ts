import { createClient } from '@supabase/supabase-js'

// Since this project has Supabase enabled automatically,
// we can use these environment variables from the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)