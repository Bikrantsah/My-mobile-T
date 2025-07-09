"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { DistributorRegistrationForm } from "@/components/distributor/registration-form"
import { MovieFormWithAI } from "@/components/movie/movie-form-with-ai"
import { MovieList } from "@/components/movie/movie-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Building, Home, Zap } from "lucide-react"

interface Distributor {
  id: number
  company_name: string
  approved: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [distributor, setDistributor] = useState<Distributor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/"
      return
    }

    setUser(user)

    // Check if user is a distributor
    const { data: distributorData } = await supabase.from("distributors").select("*").eq("user_id", user.id).single()

    if (distributorData) {
      setDistributor(distributorData)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Movie Distribution Platform</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movies">
              <Home className="w-4 h-4 mr-2" />
              Browse Movies
            </TabsTrigger>
            <TabsTrigger value="distributor">
              <Building className="w-4 h-4 mr-2" />
              Distributor
            </TabsTrigger>
            <TabsTrigger value="add-movie" disabled={!distributor?.approved}>
              <Zap className="w-4 h-4 mr-2" />
              Add Movie (AI)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Movies</CardTitle>
                  <CardDescription>Browse approved movies from our distributors</CardDescription>
                </CardHeader>
              </Card>
              <MovieList />
            </div>
          </TabsContent>

          <TabsContent value="distributor">
            <div className="space-y-6">
              {distributor ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {distributor.company_name}
                      <Badge variant={distributor.approved ? "default" : "secondary"}>
                        {distributor.approved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {distributor.approved
                        ? "Your distributor account is approved. You can now add movies with AI verification."
                        : "Your distributor registration is pending approval from administrators."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <DistributorRegistrationForm userId={user.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="add-movie">
            {distributor?.approved ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      AI-Powered Movie Submission
                    </CardTitle>
                    <CardDescription>
                      Submit your movie with automatic AI content verification for faster approval
                    </CardDescription>
                  </CardHeader>
                </Card>
                <MovieFormWithAI distributorId={distributor.id} />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    You need to be an approved distributor to add movies.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
