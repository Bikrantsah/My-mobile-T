export interface User {
  id: string
  username: string
  email: string
}

export interface Distributor {
  id: number
  user: User
  company_name: string
  approved: boolean
  created_at: string
}

export interface Movie {
  id: number
  title: string
  description: string | null
  religion_category: string | null
  language: string | null
  video_url: string | null
  distributor: Distributor
  approved: boolean
  created_at: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}
