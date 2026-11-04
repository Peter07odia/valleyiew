"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Navigation } from "lucide-react"

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
          <p className="max-w-[16ch] text-balance font-sans text-[clamp(2.5rem,5.4vw,5.5rem)] font-normal leading-[1.02] tracking-[-0.03em] [text-shadow:0_8px_36px_rgba(4,18,42,0.3)]">
            <span className="block text-[0.42em] font-light leading-tight tracking-[-0.01em] text-secondary-foreground/85">Welcome to</span>
            <span className="mt-1 block">Valleyview Medical Centre</span>
          </p>

          <p className="mt-5 max-w-2xl text-balance font-sans text-[clamp(1.35rem,2.6vw,2.6rem)] font-bold leading-tight tracking-[0.02em] text-accent-warm">
            Your health, connected with care.
          </p>

          <h1
            id="hero-heading"
            className="mt-8 max-w-2xl text-balance font-sans text-xl font-medium leading-8 text-secondary-foreground/92 [text-shadow:0_4px_20px_rgba(4,18,42,0.35)] sm:text-2xl sm:leading-9"
          >
            Walk-in and family medicine clinics in Durham Region, Peterborough and Brantford
          </h1>

          {/* Phones use the header and bottom bar for these actions. */}
          <div className="mt-12 hidden flex-wrap gap-3 sm:flex">
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
