import { supabase } from "@/lib/supabase"
import type { NextRequest } from "next/server"

export interface AuthUser {
  id: string
  email: string
  role?: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "user",
    }
  } catch (error) {
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
