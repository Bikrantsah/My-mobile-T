import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAuthUser, hasPermission } from "@/lib/auth"

// GET /api/distributors - List distributors (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    const {
      data: distributors,
      error,
      count,
    } = await supabase
      .from("distributors")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    // Get user data for each distributor
    const distributorsWithUsers = await Promise.all(
      distributors.map(async (distributor) => {
        const { data: userData } = await supabase.auth.admin.getUserById(distributor.user_id)

        return {
          id: distributor.id,
          user: {
            id: distributor.user_id,
            username: userData.user?.user_metadata?.username || userData.user?.email?.split("@")[0] || "",
            email: userData.user?.email || "",
          },
          company_name: distributor.company_name,
          approved: distributor.approved,
          created_at: distributor.created_at,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: distributorsWithUsers,
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

// POST /api/distributors - Create distributor (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()

    const { data: distributor, error } = await supabase.from("distributors").insert(body).select().single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    // Get user data
    const { data: userData } = await supabase.auth.admin.getUserById(distributor.user_id)

    const distributorWithUser = {
      id: distributor.id,
      user: {
        id: distributor.user_id,
        username: userData.user?.user_metadata?.username || userData.user?.email?.split("@")[0] || "",
        email: userData.user?.email || "",
      },
      company_name: distributor.company_name,
      approved: distributor.approved,
      created_at: distributor.created_at,
    }

    return NextResponse.json(
      {
        success: true,
        data: distributorWithUser,
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
