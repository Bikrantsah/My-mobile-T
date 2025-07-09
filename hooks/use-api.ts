"use client"

import { useState, useEffect } from "react"
import type { ApiResponse, Movie, Distributor, User } from "@/types/api"

export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [url])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, options)
      const result: ApiResponse<T> = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || "An error occurred")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => fetchData()

  return { data, loading, error, refetch }
}

export function useMovies(approved?: boolean) {
  const url = approved !== undefined ? `/api/movies?approved=${approved}` : "/api/movies"
  return useApi<Movie[]>(url)
}

export function useDistributors() {
  return useApi<Distributor[]>("/api/distributors")
}

export function useUsers() {
  return useApi<User[]>("/api/users")
}
