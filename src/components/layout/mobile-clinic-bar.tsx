"use client"

import { usePathname } from "next/navigation"
import { CalendarDays, Navigation, Phone } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { getGoogleMapsDirectionsUrl } from "@/lib/constants"

// Forms and staff pages keep their own bottom actions clear.
const HIDDEN_PATHS = ["/admin", "/new-patient-form", "/registration-reports", "/auth"]

export function useMobileClinicBarVisible() {
  const pathname = usePathname()
  const { preferredLocation } = usePreferredLocation()
  return !!preferredLocation && !HIDDEN_PATHS.some(path => pathname?.startsWith(path))
}

/** Call / Book / Directions for the chosen clinic, pinned to the bottom on phones. */
export function MobileClinicBar() {
  const { preferredLocation: clinic } = usePreferredLocation()
  const visible = useMobileClinicBarVisible()
  if (!visible || !clinic) return null

  const actions = [
    clinic.phone && { label: "Call", href: `tel:${clinic.phone.replace(/\D/g, "")}`, icon: Phone, external: false },
    clinic.bookingUrl && { label: "Book", href: clinic.bookingUrl, icon: CalendarDays, external: false },
    { label: "Directions", href: getGoogleMapsDirectionsUrl(clinic), icon: Navigation, external: true },
  ].filter(Boolean) as { label: string; href: string; icon: typeof Phone; external: boolean }[]

  return (
    <>
      {/* Keeps the footer from sitting underneath the bar. */}
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
      <nav
        aria-label={`Quick actions for ${clinic.shortName}`}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-secondary pb-[env(safe-area-inset-bottom)] text-secondary-foreground shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.4)] md:hidden"
      >
        <ul className="grid h-16" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}>
          {actions.map(({ label, href, icon: Icon, external }) => (
            <li key={label} className="border-r border-white/10 last:border-r-0">
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex h-full flex-col items-center justify-center gap-1 text-xs font-semibold active:bg-white/10"
              >
                <Icon className="size-5 text-accent-warm" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
