import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://ngcfavdkmlfjvcqjqftj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY2ZhdmRrbWxmanZjcWpxZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzQxMzksImV4cCI6MjA2NjgxMDEzOX0.Irns4W6pG_2jU5QayXxE7eaANJuP9vhZbaCgkOJZq50'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)