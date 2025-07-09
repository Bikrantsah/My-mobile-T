import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAuthUser, hasPermission } from "@/lib/auth"

async function getMovieWithNestedData(movieId: string) {
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
    .eq("id", movieId)
    .single()

  if (error) {
    throw error
  }

  // Get user data
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
}

// GET /api/movies/[id] - Retrieve movie (public read access)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movieWithNestedData = await getMovieWithNestedData(params.id)

    return NextResponse.json({
      success: true,
      data: movieWithNestedData,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Movie not found",
      },
      { status: 404 },
    )
  }
}

// PUT /api/movies/[id] - Update movie (authenticated users only, owner or admin)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "write")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Check ownership
    const { data: existingMovie } = await supabase
      .from("movies")
      .select(`
        *,
        distributors (user_id)
      `)
      .eq("id", params.id)
      .single()

    if (!existingMovie) {
      return NextResponse.json({ success: false, message: "Movie not found" }, { status: 404 })
    }

    if (existingMovie.distributors.user_id !== user.id && !hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 })
    }

    const body = await request.json()

    const { error } = await supabase.from("movies").update(body).eq("id", params.id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    const movieWithNestedData = await getMovieWithNestedData(params.id)

    return NextResponse.json({
      success: true,
      data: movieWithNestedData,
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

// PATCH /api/movies/[id] - Partial update movie (authenticated users only, owner or admin)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return PUT(request, { params }) // Same logic as PUT for partial updates
}

// DELETE /api/movies/[id] - Delete movie (authenticated users only, owner or admin)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "write")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Check ownership
    const { data: existingMovie } = await supabase
      .from("movies")
      .select(`
        *,
        distributors (user_id)
      `)
      .eq("id", params.id)
      .single()

    if (!existingMovie) {
      return NextResponse.json({ success: false, message: "Movie not found" }, { status: 404 })
    }

    if (existingMovie.distributors.user_id !== user.id && !hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 })
    }

    const { error } = await supabase.from("movies").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Movie deleted successfully",
      },
      { status: 204 },
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
