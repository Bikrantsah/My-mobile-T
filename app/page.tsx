"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { LoginForm } from "@/components/auth/login-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      if (error.message?.includes("supabaseUrl") || error.message?.includes("SUPABASE")) {
        setConfigError("Supabase configuration is missing or invalid. Please check your environment variables.")
      } else {
        setConfigError("Authentication service is unavailable.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{configError}</AlertDescription>
          </Alert>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Configuration Required</h2>
            <p className="text-sm text-gray-600 mb-4">Please ensure your .env.local file contains:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
          </div>
        </div>
      </div>
    )
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
