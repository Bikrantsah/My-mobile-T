import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

// Create a default client that won't crash the build
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)

// Export a function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://placeholder.supabase.co" &&
    supabaseAnonKey !== "placeholder-key"
  )
}

// Export configuration status
export const supabaseConfig = {
  url: supabaseUrl,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isConfigured: isSupabaseConfigured(),
}

export type Database = {
  public: {
    Tables: {
      distributors: {
        Row: {
          id: number
          user_id: string
          company_name: string
          approved: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          company_name: string
          approved?: boolean
        }
        Update: {
          company_name?: string
          approved?: boolean
        }
      }
      movies: {
        Row: {
          id: number
          title: string
          description: string | null
          religion_category: string | null
          language: string | null
          video_url: string | null
          distributor_id: number
          approved: boolean
          created_at: string
          verification_status?: string
          verification_details?: string
        }
        Insert: {
          title: string
          description?: string
          religion_category?: string
          language?: string
          video_url?: string
          distributor_id: number
          approved?: boolean
          verification_status?: string
          verification_details?: string
        }
        Update: {
          title?: string
          description?: string
          religion_category?: string
          language?: string
          video_url?: string
          approved?: boolean
          verification_status?: string
          verification_details?: string
        }
      }
    }
  }
}
