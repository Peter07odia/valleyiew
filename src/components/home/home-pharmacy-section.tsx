"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { LOCATIONS } from "@/lib/constants"
import { PharmacyEmblemCard } from "@/components/pharmacy/pharmacy-emblem-card"
import { usePreferredLocation } from "@/components/providers/preferred-location-provider"

function findLocationByQuery(value: string | null) {
  if (!value) {
    return null
  }

  const normalizedValue = value.trim().toLowerCase()

  return (
    LOCATIONS.find((location) => {
      if (location.isComingSoon) {
        return false
      }

      return [
        location.slug,
        location.shortName,
        location.city,
        location.name,
      ].some((candidate) => candidate.toLowerCase() === normalizedValue)
    }) ?? null
  )
}

export function HomePharmacySection() {
  const searchParams = useSearchParams()
  const requestedLocation = findLocationByQuery(searchParams.get("location"))
  const { preferredLocation, hasHydrated, setPreferredLocation } =
    usePreferredLocation()
  // Only the visitor's own clinic pharmacy; nothing until a clinic is known.
  const activeLocation = hasHydrated ? requestedLocation ?? preferredLocation : null

  React.useEffect(() => {
    if (
      hasHydrated &&
      requestedLocation &&
      requestedLocation.slug !== preferredLocation?.slug
    ) {
      setPreferredLocation(requestedLocation.slug)
    }
  }, [hasHydrated, preferredLocation?.slug, requestedLocation, setPreferredLocation])

  if (!activeLocation?.pharmacyName) {
    return null
  }

  return (
    <section
      id="pharmacy"
      className="scroll-mt-36 bg-muted/55 px-4 py-10 sm:px-6 lg:px-8"
      aria-label={`${activeLocation.shortName} pharmacy`}
    >
      <PharmacyEmblemCard location={activeLocation} />
    </section>
  )
}
