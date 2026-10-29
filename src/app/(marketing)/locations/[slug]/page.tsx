import { LocationTeamSection } from "@/components/team/location-team-section"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  FileText,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Pill,
  Sparkles,
} from "lucide-react"

import {
  formatLocationAddress,
  getGoogleMapsDirectionsUrl,
  hasPublishedHours,
  LOCATIONS,
} from "@/lib/constants"
import { PageHero } from "@/components/shared/page-hero"
import { HoursTable } from "@/components/locations/hours-table"
import { LocationMap } from "@/components/locations/location-map"
import { PharmacyEmblemCard } from "@/components/pharmacy/pharmacy-emblem-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LocationPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return LOCATIONS.map((location) => ({
    slug: location.slug,
  }))
}

export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const { slug } = await params
  const location = LOCATIONS.find((l) => l.slug === slug)

  if (!location) {
    return { title: "Location Not Found" }
  }

  return {
    title: `${location.shortName} Clinic`,
    description: `Valleyview Medical Centre ${location.shortName} in ${location.city}, Ontario. Find clinic hours, contact details and Ocean booking.`,
  }
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params
  const location = LOCATIONS.find((l) => l.slug === slug)

  if (!location) {
    notFound()
  }

  const isComingSoon = location.isComingSoon
  const hoursPublished = hasPublishedHours(location)
  const directionsUrl = getGoogleMapsDirectionsUrl(location)
  const [exteriorPhoto, ...interiorPhotos] = location.photos ?? []

  return (
    <>
      <PageHero
        title={location.name}
        description={
          isComingSoon
            ? "Opening details will be announced once confirmed."
            : "Find contact details, directions and online booking for your clinic. Call the clinic for appointment and walk-in availability."
        }
        imageSrc={exteriorPhoto?.src}
        imageAlt={exteriorPhoto?.alt}
      />

      {location.pharmacyName ? (
        <section
          id="pharmacy"
          className="scroll-mt-36 bg-muted/55 px-4 py-10 sm:px-6 lg:px-8"
          aria-label={`${location.shortName} pharmacy`}
        >
          <PharmacyEmblemCard location={location} />
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left column: details */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isComingSoon && location.comingSoonMessage ? (
                  <div className="flex items-start gap-3 rounded-xl border border-accent-warm/25 bg-accent-warm/10 p-4 text-sm">
                    <Sparkles
                      className="mt-0.5 size-5 shrink-0 text-accent-warm"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed text-foreground">
                      {location.comingSoonMessage}
                    </p>
                  </div>
                ) : null}

                <div className="flex items-start gap-3 text-sm">
                  <MapPin
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <address className="not-italic">
                    {formatLocationAddress(location)}
                  </address>
                </div>

                {location.phone ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <a
                      href={`tel:${location.phone.replace(/-/g, "")}`}
                      className="transition-colors hover:text-primary"
                    >
                      {location.phone}
                    </a>
                  </div>
                ) : null}

                {location.email ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <a
                      href={`mailto:${location.email}`}
                      className="transition-colors hover:text-primary"
                    >
                      {location.email}
                    </a>
                  </div>
                ) : null}

                {location.fax && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <FileText
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>Fax: {location.fax}</span>
                  </div>
                )}

                {!location.phone && !location.email && !location.fax ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/45 p-4 text-sm leading-6 text-muted-foreground">
                    Phone, email, fax, and front-desk details are to be confirmed.
                  </div>
                ) : null}

                {location.pharmacyName ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Pill
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <Link
                      href="#pharmacy"
                      className="transition-colors hover:text-primary"
                    >
                      {location.pharmacyName}
                    </Link>
                  </div>
                ) : null}

                <Button asChild variant="outline"><Link href={`/new-patient-form?clinic=${location.slug}`}>Register at this clinic</Link></Button>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  {isComingSoon ? (
                    <Button disabled>Booking Opens Soon</Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="size-4" aria-hidden="true" />
                          Get Directions
                        </a>
                      </Button>
                      {location.bookingUrl ? (
                        <Button asChild>
                          <a
                            href={location.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Book at This Location
                          </a>
                        </Button>
                      ) : location.phone ? (
                        <Button asChild>
                          <a href={`tel:${location.phone.replace(/-/g, "")}`}>
                            Call This Location
                          </a>
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link href="/book">Booking Details</Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Clinic Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hoursPublished ? (
                  <HoursTable hours={location.hours} />
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {location.phone ? "Call for current clinic hours." : "Clinic hours are to be confirmed."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: map */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {isComingSoon ? "Opening Soon" : "Find Us"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isComingSoon ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/50 p-6 text-sm leading-relaxed text-muted-foreground">
                    Map and directions will be added once the clinic details are
                    confirmed.
                  </div>
                ) : (
                  <LocationMap location={location} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {interiorPhotos.length ? (
        <section
          aria-labelledby="clinic-photos-heading"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <h2 id="clinic-photos-heading" className="mb-6 text-2xl font-semibold">
            Clinic photos
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interiorPhotos.map((photo) => (
              <li
                key={photo.src}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted ring-1 ring-border"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <LocationTeamSection headingLevel="h2" locationSlug={location.slug} />
    </>
  )
}
