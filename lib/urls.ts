import { router } from "@/lib/router"

export function getUrlPatterns() {
  return {
    // Movie URLs
    "movies-list": () => router.reverse("movies-list"),
    "movies-detail": (id: string) => router.reverse("movies-detail", { id }),
    "movies-create": () => router.reverse("movies-create"),
    "movies-update": (id: string) => router.reverse("movies-update", { id }),
    "movies-destroy": (id: string) => router.reverse("movies-destroy", { id }),

    // Distributor URLs
    "distributors-list": () => router.reverse("distributors-list"),
    "distributors-detail": (id: string) => router.reverse("distributors-detail", { id }),
    "distributors-create": () => router.reverse("distributors-create"),
    "distributors-update": (id: string) => router.reverse("distributors-update", { id }),
    "distributors-destroy": (id: string) => router.reverse("distributors-destroy", { id }),
  }
}

export const urls = getUrlPatterns()
