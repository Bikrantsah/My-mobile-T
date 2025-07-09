import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { BaseViewSet, type ViewSetPermissions } from "@/lib/viewsets"
import type { AuthUser } from "@/lib/auth"

export class DistributorViewSet extends BaseViewSet {
  protected permissions: ViewSetPermissions = {
    list: "admin", // IsAdminUser - admin only
    create: "admin", // IsAdminUser - admin only
    retrieve: "admin", // IsAdminUser - admin only
    update: "admin", // IsAdminUser - admin only
    partial_update: "admin", // IsAdminUser - admin only
    destroy: "admin", // IsAdminUser - admin only
  }

  async list(request: NextRequest, user: AuthUser | null): Promise<NextResponse> {
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
      throw new Error(error.message)
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
  }

  async create(request: NextRequest, user: AuthUser | null): Promise<NextResponse> {
    const body = await request.json()

    const { data: distributor, error } = await supabase.from("distributors").insert(body).select().single()

    if (error) {
      throw new Error(error.message)
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
  }

  async retrieve(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    const { data: distributor, error } = await supabase.from("distributors").select("*").eq("id", id).single()

    if (error) {
      throw new Error("Distributor not found")
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

    return NextResponse.json({
      success: true,
      data: distributorWithUser,
    })
  }

  async update(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    return this.partial_update(request, user, id)
  }

  async partial_update(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    const body = await request.json()

    const { error } = await supabase.from("distributors").update(body).eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return this.retrieve(request, user, id)
  }

  async destroy(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse> {
    const { error } = await supabase.from("distributors").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Distributor deleted successfully",
      },
      { status: 204 },
    )
  }
}
