"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { supabaseConfig } from "@/lib/supabase"

export function ConfigurationSetup() {
  const [showInstructions, setShowInstructions] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const envTemplate = `# Add these to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Configuration Required
            </CardTitle>
            <CardDescription>
              Your Supabase configuration is missing or incomplete. Please set up your environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${supabaseConfig.hasUrl ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm">Supabase URL</span>
                {supabaseConfig.hasUrl ? <CheckCircle className="w-4 h-4 text-green-600" /> : null}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${supabaseConfig.hasKey ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm">Supabase Key</span>
                {supabaseConfig.hasKey ? <CheckCircle className="w-4 h-4 text-green-600" /> : null}
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                To use this application, you need to configure Supabase. Follow the instructions below to get started.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={() => setShowInstructions(!showInstructions)} variant="outline">
                {showInstructions ? "Hide" : "Show"} Setup Instructions
              </Button>
              <Button asChild>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Supabase Account
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {showInstructions && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to configure your Supabase connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Create a Supabase Project</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>
                      Go to{" "}
                      <a
                        href="https://supabase.com"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        supabase.com
                      </a>
                    </li>
                    <li>Sign up or log in to your account</li>
                    <li>Create a new project</li>
                    <li>Wait for the project to be set up</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 2: Get Your API Keys</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Go to your project dashboard</li>
                    <li>Navigate to Settings → API</li>
                    <li>Copy the "Project URL" and "anon/public" key</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 3: Create Environment File</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a file named <code className="bg-gray-100 px-1 rounded">.env.local</code> in your project
                    root:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">{envTemplate}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(envTemplate)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 4: Replace Placeholder Values</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Replace the placeholder values with your actual Supabase credentials:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <code>your-project.supabase.co</code> → Your Project URL
                      </li>
                      <li>
                        <code>your-anon-key-here</code> → Your anon/public key
                      </li>
                      <li>
                        <code>your-service-role-key-here</code> → Your service role key (optional)
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 5: Restart the Application</h3>
                  <p className="text-sm text-gray-600">
                    After saving your <code className="bg-gray-100 px-1 rounded">.env.local</code> file, restart your
                    development server:
                  </p>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-2">npm run dev</pre>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Once configured, refresh this page and you should see the login form.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page After Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
