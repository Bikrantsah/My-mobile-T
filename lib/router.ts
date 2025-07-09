export interface ViewSetConfig {
  basename: string
  viewset: string
  prefix?: string
}

export interface RoutePattern {
  pattern: string
  method: string
  action: string
  name: string
}

export class DefaultRouter {
  private registry: Map<string, ViewSetConfig> = new Map()
  private routes: RoutePattern[] = []

  register(prefix: string, viewsetName: string, basename?: string) {
    const config: ViewSetConfig = {
      basename: basename || prefix,
      viewset: viewsetName,
      prefix,
    }

    this.registry.set(prefix, config)
    this.generateRoutes(prefix, config)
  }

  private generateRoutes(prefix: string, config: ViewSetConfig) {
    const basePattern = `/${prefix}`

    // List and Create routes
    this.routes.push({
      pattern: basePattern,
      method: "GET",
      action: "list",
      name: `${config.basename}-list`,
    })

    this.routes.push({
      pattern: basePattern,
      method: "POST",
      action: "create",
      name: `${config.basename}-create`,
    })

    // Detail routes (with ID parameter)
    const detailPattern = `${basePattern}/{id}`

    this.routes.push({
      pattern: detailPattern,
      method: "GET",
      action: "retrieve",
      name: `${config.basename}-detail`,
    })

    this.routes.push({
      pattern: detailPattern,
      method: "PUT",
      action: "update",
      name: `${config.basename}-update`,
    })

    this.routes.push({
      pattern: detailPattern,
      method: "PATCH",
      action: "partial_update",
      name: `${config.basename}-partial-update`,
    })

    this.routes.push({
      pattern: detailPattern,
      method: "DELETE",
      action: "destroy",
      name: `${config.basename}-destroy`,
    })
  }

  getRoutes(): RoutePattern[] {
    return this.routes
  }

  getUrlPatterns(): string[] {
    return Array.from(new Set(this.routes.map((route) => route.pattern)))
  }

  matchRoute(pathname: string, method: string): RoutePattern | null {
    for (const route of this.routes) {
      if (route.method === method && this.patternMatches(route.pattern, pathname)) {
        return route
      }
    }
    return null
  }

  private patternMatches(pattern: string, pathname: string): boolean {
    // Convert Django-style pattern to regex
    const regexPattern = pattern
      .replace(/\{(\w+)\}/g, "([^/]+)") // Replace {id} with capture group
      .replace(/\//g, "\\/") // Escape forward slashes

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(pathname)
  }

  extractParams(pattern: string, pathname: string): Record<string, string> {
    const params: Record<string, string> = {}
    const patternParts = pattern.split("/")
    const pathParts = pathname.split("/")

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]

      if (patternPart.startsWith("{") && patternPart.endsWith("}")) {
        const paramName = patternPart.slice(1, -1)
        params[paramName] = pathPart
      }
    }

    return params
  }

  reverse(name: string, params?: Record<string, string>): string {
    const route = this.routes.find((r) => r.name === name)
    if (!route) {
      throw new Error(`No route found with name: ${name}`)
    }

    let url = route.pattern
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`{${key}}`, value)
      }
    }

    return url
  }
}

// Create the router instance and register ViewSets
export const router = new DefaultRouter()
router.register("movies", "MovieViewSet")
router.register("distributors", "DistributorViewSet")
