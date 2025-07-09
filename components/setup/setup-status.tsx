"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { supabaseConfig, isSupabaseConfigured } from "@/lib/supabase"

export function SetupStatus() {
  const isConfigured = isSupabaseConfigured()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          Configuration Status
        </CardTitle>
        <CardDescription>Current Supabase setup status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Supabase URL</span>
          <Badge variant={supabaseConfig.hasUrl ? "default" : "destructive"}>
            {supabaseConfig.hasUrl ? "Set" : "Missing"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Anon Key</span>
          <Badge variant={supabaseConfig.hasKey ? "default" : "destructive"}>
            {supabaseConfig.hasKey ? "Set" : "Missing"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Overall Status</span>
          <Badge variant={isConfigured ? "default" : "destructive"}>{isConfigured ? "Ready" : "Needs Setup"}</Badge>
        </div>

        {supabaseConfig.url && (
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
            <strong>URL:</strong> {supabaseConfig.url}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
