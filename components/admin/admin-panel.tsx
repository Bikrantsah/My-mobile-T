"use client"
import { useViewSet } from "@/hooks/use-viewset"
import type { Movie, Distributor } from "@/types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, User, Building, Film } from "lucide-react"

export function AdminPanel() {
  const {
    data: distributors,
    loading: distributorsLoading,
    partialUpdate: updateDistributor,
  } = useViewSet<Distributor>("distributors")

  const {
    data: movies,
    loading: moviesLoading,
    partialUpdate: updateMovie,
    destroy: deleteMovie,
  } = useViewSet<Movie>("movies")

  const handleApproveDistributor = async (distributorId: number) => {
    try {
      await updateDistributor(distributorId, { approved: true })
    } catch (error) {
      console.error("Error approving distributor:", error)
    }
  }

  const handleApproveMovie = async (movieId: number) => {
    try {
      await updateMovie(movieId, { approved: true })
    } catch (error) {
      console.error("Error approving movie:", error)
    }
  }

  const handleRejectMovie = async (movieId: number) => {
    try {
      await deleteMovie(movieId)
    } catch (error) {
      console.error("Error rejecting movie:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Manage distributors and movies</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="distributors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="distributors">
            <Building className="w-4 h-4 mr-2" />
            Distributors
          </TabsTrigger>
          <TabsTrigger value="movies">
            <Film className="w-4 h-4 mr-2" />
            Movies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distributors">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Distributor Approvals</h3>
            {distributorsLoading ? (
              <div className="text-center py-8">Loading distributors...</div>
            ) : (
              <div className="grid gap-4">
                {distributors?.map((distributor) => (
                  <Card key={distributor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{distributor.company_name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <User className="w-4 h-4 mr-1" />
                            {distributor.user.username} ({distributor.user.email})
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered: {new Date(distributor.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={distributor.approved ? "default" : "secondary"}>
                            {distributor.approved ? "Approved" : "Pending"}
                          </Badge>
                          {!distributor.approved && (
                            <Button size="sm" onClick={() => handleApproveDistributor(distributor.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="movies">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Movie Approvals</h3>
            {moviesLoading ? (
              <div className="text-center py-8">Loading movies...</div>
            ) : (
              <div className="grid gap-4">
                {movies?.map((movie) => (
                  <Card key={movie.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{movie.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            by {movie.distributor.company_name} ({movie.distributor.user.username})
                          </p>
                          {movie.description && <p className="text-sm mt-2 line-clamp-2">{movie.description}</p>}
                          <div className="flex gap-2 mt-2">
                            {movie.religion_category && (
                              <Badge variant="outline" className="text-xs">
                                {movie.religion_category}
                              </Badge>
                            )}
                            {movie.language && (
                              <Badge variant="outline" className="text-xs">
                                {movie.language}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted: {new Date(movie.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={movie.approved ? "default" : "secondary"}>
                            {movie.approved ? "Approved" : "Pending"}
                          </Badge>
                          {!movie.approved && (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleApproveMovie(movie.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectMovie(movie.id)}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
