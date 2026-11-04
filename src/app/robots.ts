import type { MetadataRoute } from "next"
import { searchIndexingAllowed } from "@/config/clinic"

export default function robots(): MetadataRoute.Robots {
  if (!searchIndexingAllowed()) {
    return {
      sitemap: "https://valleyviewmedical.ca/sitemap.xml",
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/registration-reports", "/auth"],
    },
    sitemap: "https://valleyviewmedical.ca/sitemap.xml",
  }
}
