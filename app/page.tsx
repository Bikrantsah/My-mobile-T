"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { LoginForm } from "@/components/auth/login-form"
import { ConfigurationSetup } from "@/components/setup/configuration-setup"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Check if Supabase is configured before attempting to use it
      if (!isSupabaseConfigured()) {
        setConfigError("Supabase configuration is missing. Please add your environment variables.")
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setConfigError("Authentication service is unavailable. Please check your configuration.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (configError || !isSupabaseConfigured()) {
    return <ConfigurationSetup />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Movie Distribution Platform</h1>
          <p className="text-gray-600">Connect distributors with audiences worldwide</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
