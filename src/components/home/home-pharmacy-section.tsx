"use client"

import { PharmacyEmblemCard } from "@/components/pharmacy/pharmacy-emblem-card"
import { usePreferredLocation } from "@/components/providers/preferred-location-provider"

/** The visitor's clinic pharmacy; nothing until a clinic with a pharmacy is chosen. */
export function HomePharmacySection() {
  const { preferredLocation, hasHydrated } = usePreferredLocation()

  if (!hasHydrated || !preferredLocation?.pharmacyName) {
    return null
  }

  return (
    <section
      id="pharmacy"
      className="scroll-mt-36 bg-muted/55 px-4 py-10 sm:px-6 lg:px-8"
      aria-label={`${preferredLocation.shortName} pharmacy`}
    >
      <PharmacyEmblemCard key={preferredLocation.id} location={preferredLocation} />
    </section>
  )
}
