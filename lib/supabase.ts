import { createClient } from "@supabase/supabase-js"

// Use NEXT_PUBLIC_ prefix for client-side access and provide fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
