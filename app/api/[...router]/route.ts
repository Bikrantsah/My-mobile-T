import { type NextRequest, NextResponse } from "next/server"
import { router } from "@/lib/router"
import { MovieViewSet } from "@/lib/viewsets/movie-viewset"
import { DistributorViewSet } from "@/lib/viewsets/distributor-viewset"

// ViewSet instances
const viewsets = {
  MovieViewSet: new MovieViewSet(),
  DistributorViewSet: new DistributorViewSet(),
}

async function handleRequest(request: NextRequest, { params }: { params: { router: string[] } }) {
  const pathname = `/${params.router.join("/")}`
  const method = request.method

  // Match the route
  const matchedRoute = router.matchRoute(pathname, method)

  if (!matchedRoute) {
    return NextResponse.json(
      {
        success: false,
        message: "Route not found",
      },
      { status: 404 },
    )
  }

  // Extract parameters from the URL
  const routeParams = router.extractParams(matchedRoute.pattern, pathname)

  // Get the appropriate ViewSet
  const config = Array.from(router["registry"].values()).find((c) => pathname.startsWith(`/${c.prefix}`))

  if (!config) {
    return NextResponse.json(
      {
        success: false,
        message: "ViewSet not found",
      },
      { status: 404 },
    )
  }

  const viewset = viewsets[config.viewset as keyof typeof viewsets]

  if (!viewset) {
    return NextResponse.json(
      {
        success: false,
        message: "ViewSet implementation not found",
      },
      { status: 500 },
    )
  }

  // Dispatch to the ViewSet
  return viewset.dispatch(matchedRoute.action, request, routeParams)
}

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PUT,
  handleRequest as PATCH,
  handleRequest as DELETE,
}
