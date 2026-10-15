import type { MetadataRoute } from "next"
import { getConfiguredSiteUrl, searchIndexingAllowed } from "@/config/clinic"

export default function robots(): MetadataRoute.Robots {
  if (!searchIndexingAllowed()) {
    return {
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
    sitemap: `${getConfiguredSiteUrl().origin}/sitemap.xml`,
  }
}
