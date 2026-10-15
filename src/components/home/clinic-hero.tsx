"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Clock, MapPin, Navigation, Phone } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Button } from "@/components/ui/button"
import {
  formatLocationAddress,
  formatTime,
  getGoogleMapsDirectionsUrl,
  getTodayHours,
  isLocationOpen,
  type ClinicLocation,
} from "@/lib/constants"

const DEFAULT_HERO = {
  src: "/images/brantford/hero-clinic-conversation.jpg",
  alt: "A patient speaking with a clinician in a warm, modern clinic setting",
}

function todayStatus(location: ClinicLocation) {
  const today = getTodayHours(location)
  if (!today || today.status !== "confirmed") return "Call the clinic for today's hours"
  if (today.isClosed) return "Closed today"
  const range = `${formatTime(today.open)} – ${formatTime(today.close)}`
  return isLocationOpen(location) ? `Open now · today ${range}` : `Closed now · today ${range}`
}

export function ClinicHero() {
  const { preferredLocation: clinic } = usePreferredLocation()
  const hero = clinic?.heroImage
    ? { src: clinic.heroImage, alt: clinic.heroImageAlt ?? DEFAULT_HERO.alt }
    : DEFAULT_HERO

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[calc(100svh-6.1rem)] overflow-hidden bg-secondary text-secondary-foreground md:min-h-[calc(100svh-6.8rem)]"
    >
      {/* Keyed so each clinic's photo fades in over the plum base. */}
      <div key={hero.src} className="absolute inset-0 animate-in fade-in duration-700 motion-reduce:animate-none">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_center] sm:object-center"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,20,41,0.92)_0%,rgba(37,20,41,0.79)_38%,rgba(37,20,41,0.3)_66%,rgba(37,20,41,0.08)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-transparent to-secondary/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-6.1rem)] max-w-7xl items-center px-5 py-16 sm:px-10 md:min-h-[calc(100svh-6.8rem)] lg:px-8">
        <div className="w-full max-w-3xl">
          <div className="mb-6 flex max-w-full items-center gap-4 text-secondary-foreground/92 sm:mb-8">
            <span className="relative block size-8 shrink-0 rounded-full border-[3px] border-current">
              <span className="absolute -right-1 -top-1 block size-3 rounded-full bg-current" />
            </span>
            <p className="text-base font-medium leading-6 sm:text-lg">
              {clinic ? "Your clinic" : "Seven clinics. One Valleyview."}
            </p>
          </div>

          <h1
            id="hero-heading"
            className="max-w-[10ch] text-balance font-sans text-[clamp(3rem,7.2vw,7.75rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em] [text-shadow:0_8px_36px_rgba(22,11,25,0.28)]"
          >
            <span className="block">Valleyview</span>
            <span className="block">Medical Centre</span>
            <span className="mt-5 block text-[clamp(1.35rem,2.6vw,2.6rem)] font-bold normal-case leading-tight tracking-[0.02em] text-accent-warm [text-shadow:none]">
              {clinic ? clinic.shortName : "Connected with care"}
            </span>
          </h1>

          {clinic ? (
            <ul className="mt-7 grid max-w-2xl gap-2.5 text-sm leading-6 text-secondary-foreground/85 sm:text-base">
              <li className="flex gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-accent-warm" aria-hidden="true" />
                {formatLocationAddress(clinic)}
              </li>
              {clinic.phone ? (
                <li className="flex gap-3">
                  <Phone className="mt-1 size-4 shrink-0 text-accent-warm" aria-hidden="true" />
                  <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} className="font-semibold underline underline-offset-4">
                    {clinic.phone}
                  </a>
                </li>
              ) : null}
              <li className="flex gap-3">
                <Clock className="mt-1 size-4 shrink-0 text-accent-warm" aria-hidden="true" />
                <span>
                  {todayStatus(clinic)} ·{" "}
                  <Link href={`/locations/${clinic.slug}`} className="underline underline-offset-4">
                    Full hours
                  </Link>
                </span>
              </li>
            </ul>
          ) : (
            <p className="mt-8 max-w-xl text-base leading-7 text-secondary-foreground/80 sm:text-lg sm:leading-8">
              Family practice and everyday care across Durham Region, Peterborough and Brantford.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {clinic?.bookingUrl ? (
              <Button asChild size="lg" className="h-13 rounded-none bg-primary px-7 text-white hover:bg-primary/90">
                <a href={clinic.bookingUrl}>
                  Book appointment
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-13 rounded-none bg-primary px-7 text-white hover:bg-primary/90">
                <Link href="#services">
                  Explore our care
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
            {clinic ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-none border-white/30 bg-transparent px-7 text-white hover:bg-white hover:text-secondary"
              >
                <a href={getGoogleMapsDirectionsUrl(clinic)} target="_blank" rel="noopener noreferrer">
                  <Navigation className="size-4" aria-hidden="true" />
                  Directions
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
