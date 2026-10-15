"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Reveal } from "@/components/shared/reveal"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import { formatLocationAddress } from "@/lib/constants"
import { cn } from "@/lib/utils"

/**
 * "Find your clinic": the section pins below the header while vertical
 * scrolling slides the clinic cards sideways, then the page continues.
 * Falls back to a swipeable row for reduced motion or very short screens.
 */
export function LocationsShowcase() {
  const { preferredLocation } = usePreferredLocation()
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ pinned: false, distance: 0, top: 0, bottom: 0 })

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!section || !sticky || !viewport || !track) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let current = { pinned: false, distance: 0, top: 0, bottom: 0 }

    const position = () => {
      frame = 0
      if (!current.pinned) {
        track.style.transform = ""
        return
      }
      const progress = Math.min(1, Math.max(0, (current.top - section.getBoundingClientRect().top) / current.distance))
      track.style.transform = `translate3d(${-progress * current.distance}px, 0, 0)`
    }

    const measure = () => {
      const top = document.querySelector("header")?.getBoundingClientRect().height ?? 0
      // The phone action bar covers the bottom of the screen when shown.
      const bar = document.querySelector<HTMLElement>("[data-mobile-clinic-bar]")
      const bottom = bar && bar.offsetParent !== null ? bar.getBoundingClientRect().height : 0
      const distance = Math.max(0, Math.ceil(track.scrollWidth - viewport.clientWidth))
      // Pin only when the content fits on screen below the header. Measure the
      // content, not the pinned box (which is sized to the screen itself).
      const style = getComputedStyle(sticky)
      const content =
        (sticky.firstElementChild?.getBoundingClientRect().height ?? 0) +
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom)
      const fits = content <= window.innerHeight - top - bottom + 1
      current = { pinned: !reduceMotion.matches && distance > 0 && fits, distance, top, bottom }
      setLayout(current)
      position()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(position)
    }

    // Re-measure whenever layout settles: fonts, images and the header can all change size after mount.
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(track)
    observer.observe(sticky)
    const header = document.querySelector("header")
    if (header) observer.observe(header)
    document.fonts?.ready.then(measure)
    window.addEventListener("load", measure)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", onScroll, { passive: true })
    reduceMotion.addEventListener("change", measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener("load", measure)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", onScroll)
      reduceMotion.removeEventListener("change", measure)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="locations"
      aria-labelledby="locations-heading"
      className="relative scroll-mt-28 bg-secondary text-secondary-foreground"
      style={layout.pinned ? { height: `calc(100svh - ${layout.top + layout.bottom}px + ${layout.distance}px)` } : undefined}
    >
      <div
        ref={stickyRef}
        className={cn(
          "flex flex-col justify-center overflow-hidden px-5 py-14 sm:px-10 lg:py-16",
          layout.pinned && "sticky",
        )}
        style={layout.pinned ? { top: layout.top, height: `calc(100svh - ${layout.top + layout.bottom}px)` } : undefined}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:items-center lg:gap-12">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-warm">Find your clinic</p>
            <h2
              id="locations-heading"
              className="mt-4 max-w-[10ch] font-serif text-4xl font-medium leading-[0.94] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
            >
              Seven clinics. Care closer to home.
            </h2>
            <p className="mt-5 hidden max-w-md leading-7 text-secondary-foreground/65 sm:block">
              Call your preferred clinic for appointment enquiries or view the clinic hours before your visit.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground/45" aria-hidden="true">
              {layout.pinned ? "Keep scrolling to see every clinic →" : "Swipe to see every clinic →"}
            </p>
          </Reveal>

          <div
            ref={viewportRef}
            className={cn(
              "min-w-0",
              !layout.pinned && "-mx-5 snap-x snap-mandatory overflow-x-auto px-5 pb-3 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0",
            )}
            // Clip only the left edge so passing cards never cover the heading.
            style={layout.pinned ? { clipPath: "inset(-3rem -100vw -3rem 0)" } : undefined}
          >
            <div ref={trackRef} className="flex w-max gap-px bg-white/15 will-change-transform">
              {CLINIC_LOCATIONS.map((location, index) => {
                const selected = preferredLocation?.slug === location.slug
                return (
                  <Reveal
                    as="article"
                    effect="flip"
                    key={location.id}
                    delay={(index % 3) * 100}
                    className={cn(
                      "flex w-[78vw] max-w-[19rem] shrink-0 snap-start flex-col bg-secondary p-6 sm:w-[19rem] sm:p-7",
                      selected && "bg-[#14407f]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl text-accent-warm sm:text-4xl">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {selected ? (
                        <span className="bg-accent-warm px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary">
                          Your clinic
                        </span>
                      ) : (
                        <Reveal as="span" effect="bounce" delay={(index % 3) * 100}>
                          <MapPin className="size-5 text-primary" aria-hidden="true" />
                        </Reveal>
                      )}
                    </div>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-secondary-foreground/55">
                      {REGIONS.find(region => region.id === location.region)?.name}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">{location.shortName}</h3>
                    <p className="mt-4 text-sm leading-6 text-secondary-foreground/70">{formatLocationAddress(location)}</p>
                    {location.phone ? (
                      <a
                        href={`tel:${location.phone.replace(/\D/g, "")}`}
                        className="mt-3 w-fit font-semibold underline underline-offset-4"
                      >
                        {location.phone}
                      </a>
                    ) : null}
                    <div className="mt-auto flex flex-col gap-2 pt-6 text-sm font-semibold">
                      <Link href={`/locations/${location.slug}`} className="w-fit underline underline-offset-4">
                        Clinic details and hours
                      </Link>
                      {location.bookingUrl ? (
                        <a href={location.bookingUrl} className="flex w-fit items-center gap-1 text-accent-warm underline underline-offset-4">
                          Book at this clinic <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
