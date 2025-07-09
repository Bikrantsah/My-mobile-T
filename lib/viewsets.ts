import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, hasPermission, type AuthUser } from "@/lib/auth"

export interface ViewSetPermissions {
  list?: "read" | "write" | "admin"
  create?: "read" | "write" | "admin"
  retrieve?: "read" | "write" | "admin"
  update?: "read" | "write" | "admin"
  partial_update?: "read" | "write" | "admin"
  destroy?: "read" | "write" | "admin"
}

export abstract class BaseViewSet {
  protected permissions: ViewSetPermissions = {
    list: "read",
    create: "write",
    retrieve: "read",
    update: "write",
    partial_update: "write",
    destroy: "write",
  }

  abstract list(request: NextRequest, user: AuthUser | null): Promise<NextResponse>
  abstract create(request: NextRequest, user: AuthUser | null): Promise<NextResponse>
  abstract retrieve(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse>
  abstract update(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse>
  abstract partial_update(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse>
  abstract destroy(request: NextRequest, user: AuthUser | null, id: string): Promise<NextResponse>

  async dispatch(action: string, request: NextRequest, params?: Record<string, string>): Promise<NextResponse> {
    const user = await getAuthUser(request)
    const requiredPermission = this.permissions[action as keyof ViewSetPermissions]

    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      const statusCode = requiredPermission === "admin" ? 403 : 401
      const message = requiredPermission === "admin" ? "Admin access required" : "Authentication required"

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: statusCode },
      )
    }

    try {
      switch (action) {
        case "list":
          return await this.list(request, user)
        case "create":
          return await this.create(request, user)
        case "retrieve":
          return await this.retrieve(request, user, params?.id || "")
        case "update":
          return await this.update(request, user, params?.id || "")
        case "partial_update":
          return await this.partial_update(request, user, params?.id || "")
        case "destroy":
          return await this.destroy(request, user, params?.id || "")
        default:
          return NextResponse.json({ success: false, message: "Action not found" }, { status: 404 })
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Internal server error",
        },
        { status: 500 },
      )
    }
  }
}
