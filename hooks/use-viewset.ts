"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

export function useViewSet<T>(
  viewsetName: "movies" | "distributors",
  options?: {
    autoFetch?: boolean
    params?: Record<string, any>
  },
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set up authentication token
    const setupAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.access_token) {
        apiClient.setToken(session.access_token)
      }
    }
    setupAuth()

    if (options?.autoFetch !== false) {
      fetchData()
    }
  }, [viewsetName, options?.params])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const viewset = apiClient[viewsetName] as any
      const response = await viewset.list(options?.params)

      if (response.success) {
        setData(response.data)
      } else {
        setError(response.message || "Failed to fetch data")
      }
    } catch (err: any) {
      setError(err.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  const create = async (itemData: Partial<T>) => {
    try {
      const viewset = apiClient[viewsetName] as any
      const response = await viewset.create(itemData)

      if (response.success) {
        await fetchData() // Refresh list
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const update = async (id: number, itemData: Partial<T>) => {
    try {
      const viewset = apiClient[viewsetName] as any
      const response = await viewset.update(id, itemData)

      if (response.success) {
        await fetchData() // Refresh list
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const partialUpdate = async (id: number, itemData: Partial<T>) => {
    try {
      const viewset = apiClient[viewsetName] as any
      const response = await viewset.partialUpdate(id, itemData)

      if (response.success) {
        await fetchData() // Refresh list
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const destroy = async (id: number) => {
    try {
      const viewset = apiClient[viewsetName] as any
      const response = await viewset.destroy(id)

      if (response.success) {
        await fetchData() // Refresh list
      } else {
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    partialUpdate,
    destroy,
  }
}
