import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAuthUser, hasPermission } from "@/lib/auth"

async function getDistributorWithUser(distributorId: string) {
  const { data: distributor, error } = await supabase.from("distributors").select("*").eq("id", distributorId).single()

  if (error) {
    throw error
  }

  // Get user data
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
}

// GET /api/distributors/[id] - Retrieve distributor (admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const distributorWithUser = await getDistributorWithUser(params.id)

    return NextResponse.json({
      success: true,
      data: distributorWithUser,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Distributor not found",
      },
      { status: 404 },
    )
  }
}

// PUT /api/distributors/[id] - Update distributor (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()

    const { error } = await supabase.from("distributors").update(body).eq("id", params.id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    const distributorWithUser = await getDistributorWithUser(params.id)

    return NextResponse.json({
      success: true,
      data: distributorWithUser,
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

// PATCH /api/distributors/[id] - Partial update distributor (admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return PUT(request, { params }) // Same logic as PUT for partial updates
}

// DELETE /api/distributors/[id] - Delete distributor (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!hasPermission(user, "admin")) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const { error } = await supabase.from("distributors").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Distributor deleted successfully",
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
