"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Navigation, Pill, UserPlus } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Button } from "@/components/ui/button"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { getGoogleMapsDirectionsUrl } from "@/lib/constants"

const DEFAULT_HERO = {
  src: "/images/brantford/hero-clinic-conversation.jpg",
  alt: "A patient speaking with a clinician in a warm, modern clinic setting",
}

/** Every distinct hero photo, so switching clinics never waits on the network. */
const HERO_IMAGES = [
  DEFAULT_HERO,
  ...CLINIC_LOCATIONS.flatMap(l => (l.heroImage ? [{ src: l.heroImage, alt: l.heroImageAlt ?? DEFAULT_HERO.alt }] : [])),
].filter((image, index, all) => all.findIndex(other => other.src === image.src) === index)

export function ClinicHero() {
  const { preferredLocation: clinic } = usePreferredLocation()
  const hero = clinic?.heroImage
    ? { src: clinic.heroImage, alt: clinic.heroImageAlt ?? DEFAULT_HERO.alt }
    : DEFAULT_HERO

  // The current photo loads first; the others load once the page has finished
  // loading and sit hidden underneath, ready for an instant swap.
  const [preloadOthers, setPreloadOthers] = useState(false)
  useEffect(() => {
    const start = () => setPreloadOthers(true)
    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 0)
      return () => window.clearTimeout(id)
    }
    window.addEventListener("load", start, { once: true })
    return () => window.removeEventListener("load", start)
  }, [])

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[calc(100svh-6.1rem)] overflow-hidden bg-secondary text-secondary-foreground md:min-h-[calc(100svh-6.8rem)]"
    >
      {/* All photos stay mounted; the active one fades in over the others. */}
      {HERO_IMAGES.map(image => {
        const active = image.src === hero.src
        if (!active && !preloadOthers) return null
        return (
          <div
            key={image.src}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={image.src}
              alt={active ? image.alt : ""}
              fill
              priority={active}
              loading={active ? undefined : "eager"}
              fetchPriority={active ? "high" : "low"}
              sizes="100vw"
              className="object-cover object-[65%_center] sm:object-center"
            />
          </div>
        )
      })}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,30,66,0.92)_0%,rgba(8,30,66,0.78)_38%,rgba(8,30,66,0.28)_66%,rgba(8,30,66,0.06)_100%)]" />
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
              {clinic ? clinic.shortName : "Seven clinics. One Valleyview."}
            </p>
          </div>

          <h1
            id="hero-heading"
            className="max-w-[16ch] text-balance font-sans text-[clamp(2.5rem,5.4vw,5.5rem)] font-normal leading-[1.02] tracking-[-0.03em] [text-shadow:0_8px_36px_rgba(4,18,42,0.3)]"
          >
            <span className="block text-[0.42em] font-light leading-tight tracking-[-0.01em] text-secondary-foreground/85">Welcome to</span>
            <span className="mt-1 block">Valleyview Medical Centre</span>
            <span className="mt-5 block text-[clamp(1.35rem,2.6vw,2.6rem)] font-bold normal-case leading-tight tracking-[0.02em] text-accent-warm [text-shadow:none]">
              Your health, connected with care.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-secondary-foreground/85 sm:text-lg sm:leading-8">
            Compassionate, comprehensive family care for individuals and families{" "}
            {clinic ? `in ${clinic.city}.` : "across Durham Region, Peterborough and Brantford."}
          </p>

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
            {clinic ? (
              // Phones: registration replaces the pharmacy link (the header hides it there).
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-none border-white/30 bg-transparent px-7 text-white hover:bg-white hover:text-secondary sm:hidden"
              >
                <Link href={`/new-patient-form?clinic=${clinic.slug}`}>
                  <UserPlus className="size-4" aria-hidden="true" />
                  New patient registration
                </Link>
              </Button>
            ) : null}
            {clinic?.pharmacyName ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="hidden h-13 rounded-none border-white/30 bg-transparent px-7 text-white hover:bg-white hover:text-secondary sm:inline-flex"
              >
                {/* Several pharmacy services: jump to the pharmacy card below the hero; otherwise go straight to the pharmacy. */}
                {(clinic.pharmacyActions?.length ?? 0) > 1 || !clinic.pharmacyUrl ? (
                  <a href="#pharmacy">
                    <Pill className="size-4" aria-hidden="true" />
                    Pharmacy
                  </a>
                ) : (
                  <a href={clinic.pharmacyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${clinic.pharmacyName} (opens in a new tab)`}>
                    <Pill className="size-4" aria-hidden="true" />
                    Pharmacy
                  </a>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
