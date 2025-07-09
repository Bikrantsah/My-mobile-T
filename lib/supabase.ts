import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
        }
        Insert: {
          title: string
          description?: string
          religion_category?: string
          language?: string
          video_url?: string
          distributor_id: number
          approved?: boolean
        }
        Update: {
          title?: string
          description?: string
          religion_category?: string
          language?: string
          video_url?: string
          approved?: boolean
        }
      }
    }
  }
}
