import type { Metadata } from "next"
import { Phone, MapPin } from "lucide-react"

import { formatLocationAddress, hasPublishedHours, LOCATIONS } from "@/lib/constants"
import { HoursTable } from "@/components/locations/hours-table"
import { PageHero } from "@/components/shared/page-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact your Valleyview clinic in Durham Region, Peterborough or Brantford. Find phone numbers, addresses, fax numbers and hours.",
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Details"
        description="Find your Valleyview clinic and contact its team directly."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[2rem] border border-primary/15 bg-primary/5 p-7 sm:p-8">
            <Phone className="size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-secondary">
              Speak with your clinic team
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Call your preferred clinic for appointment enquiries. Both clinics
              follow the same weekly hours, listed below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {LOCATIONS.map((location) => (
              <Card key={location.id} className="rounded-[1.75rem]">
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {location.shortName}
                  </p>
                  <CardTitle className="text-xl font-semibold">
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                    <MapPin className="mt-1 size-4 shrink-0 text-accent-warm" aria-hidden="true" />
                    <address className="not-italic">
                      {formatLocationAddress(location)}
                    </address>
                  </div>
                  {location.postalCodeStatus === "to-be-confirmed" ? (
                    <p className="rounded-xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      Postal code to be confirmed
                    </p>
                  ) : null}
                  <div className="space-y-3 border-t border-border pt-4 text-sm">
                    {location.phone ? <p>Phone: <a href={`tel:${location.phone.replace(/-/g, "")}`} className="font-semibold text-primary underline underline-offset-4">{location.phone}</a></p> : <p className="text-muted-foreground">Contact details to be confirmed</p>}
                    {location.fax ? <p>Fax: {location.fax}</p> : null}
                    {hasPublishedHours(location) ? <HoursTable hours={location.hours} /> : <p className="text-muted-foreground">Hours to be confirmed.</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
