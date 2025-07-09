"use client"

import { useMovies } from "@/hooks/use-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Globe, Heart, User } from "lucide-react"

export function MovieList() {
  const { data: movies, loading, error } = useMovies(true) // Only approved movies

  if (loading) {
    return <div className="text-center py-8">Loading movies...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {movies?.map((movie) => (
        <Card key={movie.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="line-clamp-2">{movie.title}</CardTitle>
                <CardDescription className="mt-1">by {movie.distributor.company_name}</CardDescription>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <User className="w-3 h-3 mr-1" />
                  {movie.distributor.user.username}
                </div>
              </div>
              <Badge variant="secondary" className="ml-2">
                Approved
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {movie.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{movie.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.religion_category && (
                <Badge variant="outline" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  {movie.religion_category}
                </Badge>
              )}
              {movie.language && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  {movie.language}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(movie.created_at).toLocaleDateString()}
              </div>
              {movie.video_url && (
                <Button size="sm" asChild>
                  <a href={movie.video_url} target="_blank" rel="noopener noreferrer">
                    <Play className="w-4 h-4 mr-1" />
                    Watch
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {movies?.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">No approved movies found.</div>
      )}
    </div>
  )
}
