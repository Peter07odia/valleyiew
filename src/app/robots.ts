import type { MetadataRoute } from "next"
import {
  CLINIC_CONFIG,
  getConfiguredSiteUrl,
  isConfirmed,
} from "@/config/clinic"

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview" || !isConfirmed(CLINIC_CONFIG.domainStatus)) {
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
