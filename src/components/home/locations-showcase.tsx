"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Clock, MapPin } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Reveal } from "@/components/shared/reveal"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import { formatLocationAddress, summarizeHours } from "@/lib/constants"
import { cn } from "@/lib/utils"

/** Search-friendly link text per clinic id; address, phone and hours come from locations.json. */
const CLINIC_LINK_TEXT: Record<string, string> = {
  whitby: "Walk-in clinic in Whitby – Dundas St E",
  oshawa: "Walk-in clinic in Oshawa – Taunton Rd E",
  courtice: "Walk-in clinic in Courtice – Nash Rd",
  "lansdowne-mall": "Walk-in Peterborough – Lansdowne Mall",
  "peterborough-pharmacy": "Walk-in clinic in Peterborough – Peterborough Pharmacy",
  "lynden-road": "Walk-in clinic in Brantford – Lynden Rd",
  "colborne-east": "Walk-in clinic in Brantford – Colborne St E",
}

const REGION_GROUPS = REGIONS.map(region => ({
  ...region,
  locations: CLINIC_LOCATIONS.filter(location => location.region === region.id),
})).filter(group => group.locations.length > 0)

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
            <h2
              id="locations-heading"
              className="max-w-[12ch] font-serif text-4xl font-medium leading-[0.94] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
            >
              Find a walk-in clinic near you
            </h2>
            <p className="mt-5 max-w-md leading-7 text-secondary-foreground/70">
              Seven Valleyview clinics across Durham Region, Peterborough and Brantford.
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
            <div ref={trackRef} className="flex w-max gap-8 will-change-transform">
              {REGION_GROUPS.map(group => (
                <div key={group.id} role="group" aria-labelledby={`locations-region-${group.id}`} className="flex flex-col gap-3">
                  <h3
                    id={`locations-region-${group.id}`}
                    // Same inset as the card text, so the label lines up and isn't clipped first when sliding.
                    className="px-6 text-xs font-bold uppercase tracking-[0.18em] text-accent-warm sm:px-7"
                  >
                    {group.name}
                  </h3>
                  <div className="flex flex-1 gap-px bg-white/15">
                    {group.locations.map(location => {
                      const index = CLINIC_LOCATIONS.indexOf(location)
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
                          <h4 className="mt-8 font-serif text-2xl leading-tight">
                            <Link
                              href={`/locations/${location.slug}`}
                              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-accent-warm hover:decoration-accent-warm"
                            >
                              {CLINIC_LINK_TEXT[location.id] ?? location.shortName}
                            </Link>
                          </h4>
                          <p className="mt-4 text-sm leading-6 text-secondary-foreground/70">{formatLocationAddress(location)}</p>
                          {location.phone ? (
                            <a
                              href={`tel:${location.phone.replace(/\D/g, "")}`}
                              className="mt-3 w-fit font-semibold underline underline-offset-4"
                            >
                              {location.phone}
                            </a>
                          ) : null}
                          <p className="mt-3 flex gap-2 text-sm leading-6 text-secondary-foreground/70">
                            <Clock className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {summarizeHours(location).map(line => (
                                <span key={line} className="block">{line}</span>
                              ))}
                            </span>
                          </p>
                          {location.bookingUrl ? (
                            <div className="mt-auto pt-6 text-sm font-semibold">
                              <a href={location.bookingUrl} className="flex w-fit items-center gap-1 text-accent-warm underline underline-offset-4">
                                Book at this clinic <ArrowUpRight className="size-3.5" aria-hidden="true" />
                              </a>
                            </div>
                          ) : null}
                        </Reveal>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
