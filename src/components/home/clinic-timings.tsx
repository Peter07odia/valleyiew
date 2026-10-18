"use client"

import Image from "next/image"
import { ArrowUpRight, MapPin, Phone } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Reveal } from "@/components/shared/reveal"
import { formatTime, getTodayHours, type ClinicLocation } from "@/lib/constants"
import { cn } from "@/lib/utils"

function hoursText(hours: ClinicLocation["hours"][number]) {
  if (hours.status !== "confirmed") return "Call for hours"
  if (hours.isClosed || !hours.open) return "Closed"
  return `${formatTime(hours.open)} – ${formatTime(hours.close)}`
}

/** Home page: the visitor's clinic photo beside its full weekly timings. */
export function ClinicTimings() {
  const { preferredLocation: clinic, hasHydrated, openLocationPicker } = usePreferredLocation()

  if (!hasHydrated) return null

  if (!clinic) {
    return (
      <section aria-labelledby="timings-heading" className="bg-accent px-5 py-16 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 id="timings-heading" className="font-serif text-3xl tracking-[-0.02em] text-secondary sm:text-4xl">
            Clinic timings
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">Choose your clinic to see its opening hours.</p>
          <button
            type="button"
            onClick={openLocationPicker}
            className="mt-6 inline-flex h-12 items-center gap-2 bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <MapPin className="size-4" aria-hidden="true" />
            Choose your clinic
          </button>
        </Reveal>
      </section>
    )
  }

  const today = getTodayHours(clinic)?.day

  return (
    <section aria-labelledby="timings-heading" className="bg-accent px-5 py-16 sm:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-8 bg-white p-5 shadow-[0_30px_70px_-45px_rgba(11,42,91,0.45)] sm:p-8 lg:grid-cols-2 lg:gap-14 lg:p-10">
        {clinic.clinicPhoto ? (
          <Reveal className="relative hidden aspect-[4/3] overflow-hidden lg:block">
            <Image
              key={clinic.clinicPhoto}
              src={clinic.clinicPhoto}
              alt={clinic.clinicPhotoAlt ?? clinic.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </Reveal>
        ) : null}

        <Reveal>
          <p className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">Clinic Timings</p>
          <h2 id="timings-heading" className="mt-4 font-serif text-3xl tracking-[-0.02em] text-secondary sm:text-4xl">
            {clinic.shortName}
          </h2>

          <dl className="mt-5 text-[0.95rem]">
            {clinic.hours.map(hours => (
              <div
                key={hours.day}
                className={cn(
                  "grid grid-cols-[8.5rem_1fr] gap-3 border-b border-secondary/10 py-2.5 sm:grid-cols-[10rem_1fr]",
                  hours.day === today && "-mx-3 bg-primary/6 px-3 font-semibold",
                )}
              >
                <dt className="font-semibold text-secondary">
                  {hours.day}:
                  {hours.day === today ? <span className="sr-only"> (today)</span> : null}
                </dt>
                <dd className="text-muted-foreground">{hoursText(hours)}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-secondary/10 py-2.5 sm:grid-cols-[10rem_1fr]">
              <dt className="font-semibold text-secondary">Stat Holidays:</dt>
              <dd className="text-muted-foreground">Call for holiday hours</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm leading-6 text-muted-foreground">Note: times may vary depending on doctor availability.</p>
          <p className="mt-4 leading-7 text-muted-foreground">
            As a community-oriented medical clinic in {clinic.city}, we offer a wide range of services designed to address
            your health care needs. From routine check-ups and scheduled appointments with your family doctor to walk-in
            assessments and preventive care, we aim to be your one-stop place for maintaining and improving your
            well-being.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {clinic.bookingUrl ? (
              <a
                href={clinic.bookingUrl}
                className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Book appointment
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
            {clinic.phone ? (
              <a
                href={`tel:${clinic.phone.replace(/\D/g, "")}`}
                className="inline-flex h-12 items-center justify-center gap-2 border border-secondary/20 px-6 text-sm font-semibold text-secondary hover:border-primary"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {clinic.phone}
              </a>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
