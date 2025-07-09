import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"

// Create a separate admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin =
  serviceRoleKey && supabaseUrl
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

export interface AuthUser {
  id: string
  email: string
  role?: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return null
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)

    if (!supabaseAdmin) {
      console.warn("Supabase admin client not configured - auth will not work properly")
      return null
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "user",
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export function isAuthenticated(user: AuthUser | null): boolean {
  return user !== null
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin"
}

export function hasPermission(user: AuthUser | null, permission: "read" | "write" | "admin"): boolean {
  switch (permission) {
    case "read":
      return true // Everyone can read
    case "write":
      return isAuthenticated(user)
    case "admin":
      return isAdmin(user)
    default:
      return false
  }
}
