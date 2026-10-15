"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Navigation } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Button } from "@/components/ui/button"
import { getGoogleMapsDirectionsUrl } from "@/lib/constants"

const DEFAULT_HERO = {
  src: "/images/brantford/hero-clinic-conversation.jpg",
  alt: "A patient speaking with a clinician in a warm, modern clinic setting",
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
            className="max-w-[10ch] text-balance font-sans text-[clamp(3rem,7.2vw,7.75rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em] [text-shadow:0_8px_36px_rgba(4,18,42,0.3)]"
          >
            <span className="block">Valleyview</span>
            <span className="block">Medical Centre</span>
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
          </div>
        </div>
      </div>
    </section>
  )
}
