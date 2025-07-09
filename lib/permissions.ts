import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, hasPermission, type AuthUser } from "@/lib/auth"

export async function withPermissions(
  request: NextRequest,
  requiredPermission: "read" | "write" | "admin",
  handler: (request: NextRequest, user: AuthUser | null) => Promise<NextResponse>,
): Promise<NextResponse> {
  const user = await getAuthUser(request)

  if (!hasPermission(user, requiredPermission)) {
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

  return handler(request, user)
}

export function createPermissionHandler(permission: "read" | "write" | "admin") {
  return (handler: (request: NextRequest, user: AuthUser | null) => Promise<NextResponse>) => {
    return (request: NextRequest, context?: any) => withPermissions(request, permission, handler)
  }
}
