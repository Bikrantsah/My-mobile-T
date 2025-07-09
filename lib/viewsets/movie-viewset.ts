import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { BaseViewSet, type ViewSetPermissions } from "@/lib/viewsets"
import type { AuthUser } from "@/lib/auth"

export class MovieViewSet extends BaseViewSet {
  protected permissions: ViewSetPermissions = {
    list: "read", // IsAuthenticatedOrReadOnly - anyone can read
    create: "write", // IsAuthenticatedOrReadOnly - authenticated can write
    retrieve: "read", // IsAuthenticatedOrReadOnly - anyone can read
    update: "write", // IsAuthenticatedOrReadOnly - authenticated can write
    partial_update: "write", // IsAuthenticatedOrReadOnly - authenticated can write
    destroy: "write", // IsAuthenticatedOrReadOnly - authenticated can write
  }

  async list(request: NextRequest, user: AuthUser | null): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const approved = searchParams.get("approved")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = supabase
      .from("movies")
      .select(
        `
        *,
        distributors (
          id,
          user_id,
          company_name,
          approved,
          created_at
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (approved !== null) {
      query = query.eq("approved", approved === "true")
    }

    const { data: movies, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Get user data for each distributor
    const moviesWithNestedData = await Promise.all(
      movies.map(async (movie) => {
        const { data: userData } = await supabase.auth.admin.getUserById(movie.distributors.user_id)

        return {
          id: movie.id,
          title: movie.title,
          description: movie.description,
          religion_category: movie.religion_category,
          language: movie.language,
          video_url: movie.video_url,
          distributor: {
            id: movie.distributors.id,
            user: {
              id: movie.distributors.user_id,
              username: userData.user?.user_metadata?.username || userData.user?.email?.split("@")[0] || "",
              email: userData.user?.email || "",
            },
            company_name: movie.distributors.company_name,
            approved: movie.distributors.approved,
            created_at: movie.distributors.created_at,
          },
          approved: movie.approved,
          created_at: movie.created_at,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: moviesWithNestedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  }

  async create(request: NextRequest, user: AuthUser | null): Promise<NextResponse> {
    const body = await request.json()

    // Validate that the user owns the distributor or is admin
    const { data: distributor } = await supabase
      .from("distributors")
      .select("user_id")
      .eq("id", body.distributor_id)
      .single()

    if (!distributor || (distributor.user_id !== user?.id && user?.role !== "admin")) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 })
    }

    const { data: movie, error } = await supabase
      .from("movies")
      .insert(body)
      .select(`
        *,
        distributors (
          id,
          user_id,
          company_name,
          approved,
          created_at
        )
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Get user data
    const { data: userData } = await supabase.auth.admin.getUserById(movie.distributors.user_id)

    const movieWithNestedData = {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      religion_category: movie.religion_category,
      language: movie.language,
      video_url: movie.video_url,
      distributor: {
        id: movie.distributors.id,
        user: {
          id: movie.distributors.user_id,
          username: userData.user?.user_metadata?.username || userData.user?.email?.split("@")[0] || "",
          email: userData.user?.email || "",
        },
        company_name: movie.distributors.company_name,
        approved: movie.distributors.approved,
        created_at: movie.distributors.created_at,
      },
      approved: movie.approved,
      created_at: movie.created_at,
    }

    return NextResponse.json(
      {
        success: true,
        data: movieWithNestedData,
      },
      { status: 201 },
    )
  }

  async retrieve(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    const { data: movie, error } = await supabase
      .from("movies")
      .select(`
        *,
        distributors (
          id,
          user_id,
          company_name,
          approved,
          created_at
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      throw new Error("Movie not found")
    }

    // Get user data
    const { data: userData } = await supabase.auth.admin.getUserById(movie.distributors.user_id)

    const movieWithNestedData = {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      religion_category: movie.religion_category,
      language: movie.language,
      video_url: movie.video_url,
      distributor: {
        id: movie.distributors.id,
        user: {
          id: movie.distributors.user_id,
          username: userData.user?.user_metadata?.username || userData.user?.email?.split("@")[0] || "",
          email: userData.user?.email || "",
        },
        company_name: movie.distributors.company_name,
        approved: movie.distributors.approved,
        created_at: movie.distributors.created_at,
      },
      approved: movie.approved,
      created_at: movie.created_at,
    }

    return NextResponse.json({
      success: true,
      data: movieWithNestedData,
    })
  }

  async update(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    return this.partial_update(request, user, id)
  }

  async partial_update(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    // Check ownership
    const { data: existingMovie } = await supabase
      .from("movies")
      .select(`
        *,
        distributors (user_id)
      `)
      .eq("id", id)
      .single()

    if (!existingMovie) {
      return NextResponse.json({ success: false, message: "Movie not found" }, { status: 404 })
    }

    if (existingMovie.distributors.user_id !== user?.id && user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 })
    }

    const body = await request.json()

    const { error } = await supabase.from("movies").update(body).eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return this.retrieve(request, user, id)
  }

  async destroy(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    // Check ownership
    const { data: existingMovie } = await supabase
      .from("movies")
      .select(`
        *,
        distributors (user_id)
      `)
      .eq("id", id)
      .single()

    if (!existingMovie) {
      return NextResponse.json({ success: false, message: "Movie not found" }, { status: 404 })
    }

    if (existingMovie.distributors.user_id !== user?.id && user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 })
    }

    const { error } = await supabase.from("movies").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Movie deleted successfully",
      },
      { status: 204 },
    )
  }
}
