import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Handle CORS
  const response = NextResponse.next()

  // CORS_ALLOW_ALL_ORIGINS = True equivalent
  const origin = request.headers.get("origin")
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*")
  }

  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
