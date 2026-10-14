import { ExternalLink } from "lucide-react"

import type { ClinicLocation } from "@/lib/constants"
import {
  formatLocationAddress,
  getGoogleMapsDirectionsUrl,
} from "@/lib/constants"

interface LocationMapProps {
  location: ClinicLocation
}

export function LocationMap({ location }: LocationMapProps) {
  const query = encodeURIComponent(formatLocationAddress(location))
  const embedUrl = `https://www.google.com/maps?q=${query}&z=15&output=embed`
  const directionsUrl = getGoogleMapsDirectionsUrl(location)

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border/60 bg-muted">
        <iframe
          title={`Map for ${location.name}`}
          src={embedUrl}
          className="aspect-[16/9] min-h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
      >
        Open in Google Maps
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </a>
    </div>
  )
}
