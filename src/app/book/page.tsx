import Link from "next/link"
import { CalendarClock, Phone, MapPin } from "lucide-react"

import { HoursTable } from "@/components/locations/hours-table"
import { hasPublishedHours } from "@/lib/constants"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import {
  CLINIC_CONFIG,
  CLINIC_LOCATIONS,
  type ClinicLocation,
} from "@/config/clinic"

export const metadata = {
  title: "Book an appointment",
  description: `Book an appointment through Ocean at your chosen clinic with ${CLINIC_CONFIG.siteName}.`,
}

function locationAddress(location: ClinicLocation) {
  const provinceAndPostal = [location.province, location.postalCode]
    .filter(Boolean)
    .join(" ")

  return [location.address, location.city, provinceAndPostal]
    .filter(Boolean)
    .join(", ")
}

function OceanBookingOptions() {
  return (
    <div className="max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
        Online booking
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-secondary sm:text-4xl">
        Book your appointment
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Choose your clinic below to continue to its Ocean booking
        page. For help with an appointment, call your clinic directly.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLINIC_LOCATIONS.map((location) => (
          <article
            key={location.id}
            className="rounded-2xl border border-primary/12 bg-white/80 p-5 shadow-sm ring-1 ring-black/5"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {location.name}
            </h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                {locationAddress(location)}
                {location.postalCodeStatus !== "confirmed" ? (
                  <span className="mt-1 block">Postal code: To be confirmed</span>
                ) : null}
              </span>
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {location.phone ? <a href={`tel:${location.phone.replace(/-/g, "")}`} className="font-semibold text-primary underline underline-offset-4">{location.phone}</a> : "Contact details: To be confirmed"}
            </p>
            {location.bookingUrl ? (
              <Button asChild className="mt-5 w-full">
                <a href={location.bookingUrl}>Book at {location.shortName}</a>
              </Button>
            ) : null}
            {hasPublishedHours(location) ? (
              <div className="mt-4"><HoursTable hours={location.hours} /></div>
            ) : <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              Hours and availability: To be confirmed
            </p>}
          </article>
        ))}
      </div>

      <Button asChild variant="outline" className="mt-6">
        <Link href="/contact">View contact information</Link>
      </Button>
    </div>
  )
}

export default function BookPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[linear-gradient(180deg,#F8FBFA_0%,#FFFFFF_52%,#F6FAF9_100%)]">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <OceanBookingOptions />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
