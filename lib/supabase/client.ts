import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Create client - always provide values to prevent errors
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create component client with try-catch to handle missing env vars
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

try {
  supabaseClient = createClientComponentClient()
} catch (error) {
  // Fallback if createClientComponentClient fails
  console.warn('⚠️ Supabase component client initialization failed. Using fallback.')
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey) as any
}

export { supabaseClient }

