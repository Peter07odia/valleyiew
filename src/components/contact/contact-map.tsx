"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { formatLocationAddress, getGoogleMapsDirectionsUrl } from "@/lib/constants"
import { cn } from "@/lib/utils"

/** Map of one clinic at a time, defaulting to the visitor's clinic. */
export function ContactMap() {
  const { preferredLocation } = usePreferredLocation()
  const [picked, setPicked] = useState<string | null>(null)
  const clinic =
    CLINIC_LOCATIONS.find(l => l.slug === picked) ?? preferredLocation ?? CLINIC_LOCATIONS[0]
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(formatLocationAddress(clinic))}&z=15&output=embed`

  return (
    <div>
      <div role="group" aria-label="Show a clinic on the map" className="flex gap-2 overflow-x-auto pb-3">
        {CLINIC_LOCATIONS.map(l => {
          const active = l.slug === clinic.slug
          return (
            <button
              key={l.slug}
              type="button"
              aria-pressed={active}
              onClick={() => setPicked(l.slug)}
              className={cn(
                "shrink-0 border px-3 py-2 text-xs font-semibold transition-colors",
                active ? "border-secondary bg-secondary text-white" : "border-secondary/20 bg-white text-secondary hover:border-primary",
              )}
            >
              {l.shortName}
            </button>
          )
        })}
      </div>
      <div className="overflow-hidden border border-secondary/15 bg-muted">
        <iframe
          key={clinic.slug}
          title={`Map of ${clinic.name}`}
          src={embed}
          className="h-[22rem] w-full border-0 sm:h-[26rem]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={getGoogleMapsDirectionsUrl(clinic)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Directions to {clinic.shortName}
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </a>
    </div>
  )
}
