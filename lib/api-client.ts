"use client"

import type { Movie, Distributor, ApiResponse } from "@/types/api"
import { urls } from "@/lib/urls"

class APIClient {
  private baseURL = "/api"
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    return response.json()
  }

  // Movie ViewSet methods using router URLs
  movies = {
    list: (params?: { page?: number; limit?: number; approved?: boolean }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.approved !== undefined) searchParams.set("approved", params.approved.toString())

      const query = searchParams.toString()
      const endpoint = urls["movies-list"]()
      return this.request<Movie[]>(`${endpoint}${query ? `?${query}` : ""}`)
    },

    retrieve: (id: number) => this.request<Movie>(urls["movies-detail"](id.toString())),

    create: (data: Partial<Movie>) =>
      this.request<Movie>(urls["movies-create"](), {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: number, data: Partial<Movie>) =>
      this.request<Movie>(urls["movies-update"](id.toString()), {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    partialUpdate: (id: number, data: Partial<Movie>) =>
      this.request<Movie>(urls["movies-detail"](id.toString()), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    destroy: (id: number) =>
      this.request<void>(urls["movies-destroy"](id.toString()), {
        method: "DELETE",
      }),
  }

  // Distributor ViewSet methods using router URLs
  distributors = {
    list: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())

      const query = searchParams.toString()
      const endpoint = urls["distributors-list"]()
      return this.request<Distributor[]>(`${endpoint}${query ? `?${query}` : ""}`)
    },

    retrieve: (id: number) => this.request<Distributor>(urls["distributors-detail"](id.toString())),

    create: (data: Partial<Distributor>) =>
      this.request<Distributor>(urls["distributors-create"](), {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: number, data: Partial<Distributor>) =>
      this.request<Distributor>(urls["distributors-update"](id.toString()), {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    partialUpdate: (id: number, data: Partial<Distributor>) =>
      this.request<Distributor>(urls["distributors-detail"](id.toString()), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    destroy: (id: number) =>
      this.request<void>(urls["distributors-destroy"](id.toString()), {
        method: "DELETE",
      }),
  }
}

export const apiClient = new APIClient()
