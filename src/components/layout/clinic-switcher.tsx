"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Navigation, Phone } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import { clinicSlugForPath } from "@/lib/clinic-path"
import {
  formatTime,
  getGoogleMapsDirectionsUrl,
  getTodayHours,
  hasPublishedHours,
  isLocationOpen,
  type ClinicLocation,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

// Intake and staff pages have their own clinic handling; never interrupt them.
const SKIP_PATHS = ["/admin", "/new-patient-form", "/registration-reports", "/auth"]

/** Short labels for the top-bar tabs. */
const TAB_LABELS: Record<string, string> = {
  whitby: "Whitby",
  oshawa: "Oshawa",
  courtice: "Courtice",
  "lansdowne-mall": "Lansdowne Mall",
  "peterborough-pharmacy": "Lansdowne St",
  "lynden-road": "Lynden",
  "colborne-east": "Colborne",
}

const regionName = (location: ClinicLocation) => REGIONS.find(r => r.id === location.region)?.name ?? ""

function status(location: ClinicLocation) {
  const today = getTodayHours(location)
  if (!hasPublishedHours(location) || !today || today.status !== "confirmed") {
    return { label: "Call for hours", tone: "bg-secondary/80", today: "Call for today's hours" }
  }
  if (today.isClosed) return { label: "Closed today", tone: "bg-primary", today: "Closed today" }
  const open = isLocationOpen(location)
  return {
    label: open ? "Open now" : "Closed now",
    tone: open ? "bg-success" : "bg-primary",
    today: `Today: ${formatTime(today.open)} – ${formatTime(today.close)}`,
  }
}

/**
 * Top-bar clinic selector. The panel drops down from the bar with one row of
 * compact clinic cards that scrolls sideways. Visitors without a saved clinic
 * must choose one first, unless the page already identifies the clinic.
 */
export function ClinicSwitcher() {
  const pathname = usePathname()
  const {
    preferredLocation,
    hasHydrated,
    setPreferredLocation,
    isPickerOpen,
    openLocationPicker,
    closeLocationPicker,
  } = usePreferredLocation()

  // Visitors landing on a page about one clinic get that clinic without asking.
  const impliedClinic = clinicSlugForPath(pathname)
  useEffect(() => {
    if (hasHydrated && !preferredLocation && impliedClinic) setPreferredLocation(impliedClinic)
  }, [hasHydrated, preferredLocation, impliedClinic, setPreferredLocation])

  const required =
    hasHydrated &&
    !preferredLocation &&
    !impliedClinic &&
    !SKIP_PATHS.some(path => pathname?.startsWith(path))
  const open = required || (hasHydrated && isPickerOpen)

  function choose(slug: string) {
    setPreferredLocation(slug)
    closeLocationPicker()
  }

  return (
    <Popover
      open={open}
      modal={required}
      onOpenChange={next => (next ? openLocationPicker() : !required && closeLocationPicker())}
    >
      <PopoverAnchor asChild>
        <div className="flex w-full min-w-0 items-center gap-4">
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={preferredLocation ? `Change clinic, currently ${preferredLocation.shortName}` : "Choose your clinic"}
              className="inline-flex min-w-0 shrink items-center gap-2 py-1 font-semibold transition-colors hover:text-accent-warm focus-visible:outline-2 focus-visible:outline-white"
            >
              <MapPin className="size-3.5 shrink-0 text-accent-warm" aria-hidden="true" />
              <span className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">
                {preferredLocation ? preferredLocation.shortName : "Choose your clinic"}
              </span>
              <ChevronDown
                className={cn("size-3 shrink-0 text-white/60 transition-transform duration-200", open && "rotate-180")}
                aria-hidden="true"
              />
            </button>
          </PopoverTrigger>
          <span className="hidden h-5 w-px shrink-0 bg-white/15 lg:block" aria-hidden="true" />
          <div className="ml-auto hidden min-w-0 items-center overflow-x-auto lg:flex" role="group" aria-label="Clinics">
            {CLINIC_LOCATIONS.map(location => {
              const selected = preferredLocation?.slug === location.slug
              return (
                <button
                  key={location.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(location.slug)}
                  className={cn(
                    "shrink-0 border-l border-white/15 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] transition-colors first:border-l-0 focus-visible:outline-2 focus-visible:outline-white xl:px-4",
                    selected ? "text-accent-warm" : "text-white/65 hover:text-white",
                  )}
                >
                  {TAB_LABELS[location.id] ?? location.shortName}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverAnchor>

      {/* Dims the page while choosing; clicking it closes the panel unless a choice is required. */}
      {open && typeof document !== "undefined"
        ? createPortal(<div className="fixed inset-0 z-40 bg-secondary/35 backdrop-blur-[2px]" aria-hidden="true" />, document.body)
        : null}

      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={10}
        collisionPadding={8}
        aria-label="Choose your clinic"
        onEscapeKeyDown={event => required && event.preventDefault()}
        onInteractOutside={event => required && event.preventDefault()}
        className="w-[min(96vw,84rem)] gap-0 rounded-[26px] border border-white/20 bg-background/80 p-4 text-foreground shadow-[0_28px_90px_-36px_rgba(15,23,42,0.45)] ring-0 backdrop-blur-2xl sm:p-5"
      >
        <ClinicPanel selected={preferredLocation} onChoose={choose} onNavigate={closeLocationPicker} required={required} />
      </PopoverContent>
    </Popover>
  )
}

function ClinicPanel({
  selected,
  onChoose,
  onNavigate,
  required,
}: {
  selected: ClinicLocation | null
  onChoose: (slug: string) => void
  onNavigate: () => void
  required: boolean
}) {
  const track = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  const update = useCallback(() => {
    const el = track.current
    if (el) setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    // Bring the current clinic into view when the panel opens.
    el.querySelector<HTMLElement>("[data-selected=true]")?.scrollIntoView({ block: "nearest", inline: "center" })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    update()
    return () => observer.disconnect()
  }, [update])

  function move(direction: number) {
    const el = track.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduce ? "instant" : "smooth" })
  }

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary sm:text-xs">
            Valleyview Medical Centre
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-secondary">
            {required ? "Choose your clinic" : "Find us near you"}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">
            {selected
              ? `Using ${selected.shortName} as your clinic. Pick another to switch.`
              : "Choose a clinic to see its hours, doctors, contact details and online booking."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/locations"
            onClick={onNavigate}
            className="hidden text-sm font-semibold text-primary hover:text-primary/80 sm:inline"
          >
            View all locations
          </Link>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={edges.start}
            aria-label="Previous clinics"
            className="hidden size-9 items-center justify-center rounded-full border border-secondary/15 bg-white/70 text-secondary transition-opacity disabled:opacity-35 md:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={edges.end}
            aria-label="Next clinics"
            className="hidden size-9 items-center justify-center rounded-full border border-secondary/15 bg-white/70 text-secondary transition-opacity disabled:opacity-35 md:flex"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        onScroll={update}
        className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-1 pb-2 [scrollbar-width:thin]"
      >
        {CLINIC_LOCATIONS.map(location => (
          <ClinicCard
            key={location.id}
            location={location}
            selected={selected?.slug === location.slug}
            onChoose={() => onChoose(location.slug)}
          />
        ))}
      </div>
      <Link href="/locations" onClick={onNavigate} className="mt-2 block px-1 text-sm font-semibold text-primary sm:hidden">
        View all locations
      </Link>
    </>
  )
}

function ClinicCard({ location, selected, onChoose }: { location: ClinicLocation; selected: boolean; onChoose: () => void }) {
  const info = status(location)
  return (
    <article
      data-selected={selected}
      className={cn(
        // Cards share the row so all seven fit on wide screens; narrower screens scroll sideways.
        "flex w-[13rem] shrink-0 snap-start flex-col overflow-hidden rounded-[18px] border bg-white/85 shadow-[0_18px_45px_-30px_rgba(28,46,74,0.5)] transition-all duration-200 lg:w-auto lg:min-w-[10rem] lg:max-w-[15rem] lg:flex-1",
        selected ? "border-primary ring-2 ring-primary/35" : "border-white/70 hover:-translate-y-0.5 hover:border-primary/40",
      )}
    >
      <div className={cn("flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] font-medium text-white", info.tone)}>
        <span className="size-1.5 rounded-full bg-white/85" aria-hidden="true" />
        {info.label}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <span className="block text-[0.58rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {regionName(location)}
          </span>
          <span className="mt-0.5 flex items-start justify-between gap-1.5">
            <span className="text-sm font-semibold leading-tight tracking-tight text-secondary">{location.shortName}</span>
            {selected ? <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
          </span>
        </div>
        <ul className="space-y-1 text-[11px] leading-4 text-muted-foreground">
          <li className="flex gap-1.5">
            <MapPin className="mt-px size-3 shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-2">{location.address}, {location.city}</span>
          </li>
          {location.phone ? (
            <li className="flex gap-1.5">
              <Phone className="mt-px size-3 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${location.phone.replace(/\D/g, "")}`} className="font-semibold text-secondary hover:underline">
                {location.phone}
              </a>
            </li>
          ) : null}
          <li className="flex gap-1.5">
            <Clock className="mt-px size-3 shrink-0 text-primary" aria-hidden="true" />
            {info.today}
          </li>
        </ul>
        <div className="mt-auto space-y-1.5 pt-1">
          <button
            type="button"
            onClick={onChoose}
            aria-pressed={selected}
            aria-label={selected ? `${location.shortName} is your clinic` : `Choose ${location.shortName}`}
            className={cn(
              "h-8 w-full rounded-full text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              selected ? "bg-secondary text-white" : "bg-primary text-white hover:bg-primary/90",
            )}
          >
            {selected ? "Your clinic" : "Choose this clinic"}
          </button>
          <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-semibold">
            {location.bookingUrl ? (
              <a href={location.bookingUrl} onClick={onChoose} className="text-primary hover:underline">
                Book here
              </a>
            ) : <span />}
            <a
              href={getGoogleMapsDirectionsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-secondary hover:underline"
            >
              <Navigation className="size-3" aria-hidden="true" />
              Directions
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
