"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { LoginForm } from "@/components/auth/login-form"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)

    if (user) {
      window.location.href = "/dashboard"
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
