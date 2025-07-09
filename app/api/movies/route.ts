import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAuthUser, hasPermission } from "@/lib/auth"

// GET /api/movies - List movies (public read access)
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// POST /api/movies - Create movie (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "write")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate that the user owns the distributor or is admin
    const { data: distributor } = await supabase
      .from("distributors")
      .select("user_id")
      .eq("id", body.distributor_id)
      .single()

    if (!distributor || (distributor.user_id !== user.id && !hasPermission(user, "admin"))) {
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
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
