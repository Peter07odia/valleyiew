"use client"

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Mail, MapPin, Navigation, Phone, X } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { CityTab } from "./city-tab"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import { clinicSlugForPath } from "@/lib/clinic-path"
import {
  formatTime,
  getGoogleMapsDirectionsUrl,
  getTodayHours,
  hasPublishedHours,
  isLocationOpen,
  summarizeHours,
  type ClinicLocation,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

// Intake and staff pages have their own clinic handling; never interrupt them.
export const SKIP_PATHS = ["/admin", "/new-patient-form", "/registration-reports", "/auth"]

/** Top-bar tabs: one per city; cities with several clinics open a small menu. */
const CITY_GROUPS = CLINIC_LOCATIONS.reduce<{ city: string; locations: ClinicLocation[] }[]>((groups, location) => {
  const group = groups.find(g => g.city === location.city)
  if (group) group.locations.push(location)
  else groups.push({ city: location.city, locations: [location] })
  return groups
}, [])

const DESKTOP_QUERY = "(min-width: 1024px)"
function subscribeDesktop(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
/** True on laptop/desktop widths; false on phones, tablets and during server render. */
export function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP_QUERY).matches, () => false)
}

const regionName = (location: ClinicLocation) => REGIONS.find(r => r.id === location.region)?.name ?? ""

function status(location: ClinicLocation) {
  const today = getTodayHours(location)
  if (!hasPublishedHours(location) || !today || today.status !== "confirmed") {
    return { label: "Call for hours", tone: "bg-muted-foreground", today: "Call for today's hours" }
  }
  if (today.isClosed) return { label: "Closed today", tone: "bg-secondary", today: "Closed today" }
  const open = isLocationOpen(location)
  return {
    label: open ? "Open now" : "Closed now",
    tone: open ? "bg-success" : "bg-secondary",
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

  // Phones and tablets are never forced to choose; the top-bar selector is enough there.
  const isDesktop = useIsDesktop()
  const required =
    isDesktop &&
    hasHydrated &&
    !preferredLocation &&
    !impliedClinic &&
    !SKIP_PATHS.some(path => pathname?.startsWith(path))
  const open = required || (hasHydrated && isPickerOpen)
  // Desktop: with a clinic chosen the bar shows its details; clicking the clinic name swaps in the city tabs.
  const [browsing, setBrowsing] = useState(false)
  const showDetails = Boolean(preferredLocation) && !browsing

  function choose(slug: string) {
    setPreferredLocation(slug)
    closeLocationPicker()
    setBrowsing(false)
  }

  return (
    <Popover
      open={open}
      modal={required}
      onOpenChange={next => (next ? openLocationPicker() : !required && closeLocationPicker())}
    >
      <PopoverAnchor asChild>
        <div className="flex w-full min-w-0 items-center justify-start lg:justify-center">
          {/* Phones: one button opens the full picker (no room for tabs, no hover). */}
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={preferredLocation ? `Change clinic, currently ${preferredLocation.shortName}` : "Choose your clinic"}
              className="inline-flex min-w-0 items-center gap-2 py-1 font-semibold transition-colors hover:text-accent-warm focus-visible:outline-2 focus-visible:outline-white lg:hidden"
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
          {/* Desktop: the chosen clinic's details, or centred city tabs (hover a city for its clinics). */}
          {showDetails && preferredLocation ? (
            <ClinicDetails clinic={preferredLocation} onChange={() => setBrowsing(true)} />
          ) : (
            <nav
              className="hidden items-center lg:flex"
              aria-label="Clinics by city"
              onKeyDown={event => event.key === "Escape" && setBrowsing(false)}
            >
              {CITY_GROUPS.map(({ city, locations }) => (
                <CityTab
                  key={city}
                  city={city}
                  locations={locations}
                  selectedSlug={preferredLocation?.slug}
                  onChoose={choose}
                />
              ))}
              {preferredLocation ? (
                <button
                  type="button"
                  onClick={() => setBrowsing(false)}
                  aria-label={`Keep ${preferredLocation.shortName}`}
                  className="ml-2 inline-flex size-6 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </nav>
          )}
        </div>
      </PopoverAnchor>

      {/* Dims the page while choosing; clicking it closes the panel unless a choice is required. */}
      {open && isDesktop && typeof document !== "undefined"
        ? createPortal(<div className="fixed inset-0 z-40 bg-secondary/35 backdrop-blur-[2px]" aria-hidden="true" />, document.body)
        : null}

      {isDesktop ? (
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
      ) : (
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          collisionPadding={12}
          aria-label="Choose your clinic"
          className="w-[min(calc(100vw-1.5rem),22rem)] gap-0 rounded-xl border border-secondary/10 p-1.5 shadow-[0_18px_50px_-24px_rgba(11,42,91,0.45)]"
        >
          <ClinicList selected={preferredLocation} onChoose={choose} onNavigate={closeLocationPicker} />
        </PopoverContent>
      )}
    </Popover>
  )
}

/** Phones and tablets: a plain list of clinics grouped by region. */
function ClinicList({
  selected,
  onChoose,
  onNavigate,
}: {
  selected: ClinicLocation | null
  onChoose: (slug: string) => void
  onNavigate: () => void
}) {
  return (
    <div className="max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-contain">
      {REGIONS.map(region => (
        <div key={region.id} role="group" aria-label={region.name} className="py-1">
          <p className="px-2.5 pt-1 pb-0.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">{region.name}</p>
          {CLINIC_LOCATIONS.filter(location => location.region === region.id).map(location => {
            const isSelected = selected?.slug === location.slug
            return (
              <button
                key={location.slug}
                type="button"
                onClick={() => onChoose(location.slug)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                  isSelected ? "bg-primary/8" : "hover:bg-muted active:bg-muted",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-secondary">{location.shortName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{location.address}</span>
                </span>
                {isSelected ? <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="Your clinic" /> : null}
              </button>
            )
          })}
        </div>
      ))}
      <Link
        href="/locations"
        onClick={onNavigate}
        className="mt-1 block border-t border-secondary/10 px-2.5 pt-2.5 pb-1.5 text-xs font-semibold text-primary"
      >
        View all locations
      </Link>
    </div>
  )
}

/** Desktop top bar for the chosen clinic: phone, email, weekly hours and the clinic name. */
function ClinicDetails({ clinic, onChange }: { clinic: ClinicLocation; onChange: () => void }) {
  const item = "flex shrink-0 items-center gap-2 border-l border-white/15 px-5 first:border-l-0 first:pl-0 last:pr-0"
  return (
    <div className="hidden min-w-0 items-center text-[13px] text-white/85 lg:flex" aria-label={`${clinic.shortName} details`} role="group">
      {clinic.phone ? (
        <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} className={cn(item, "hover:text-white")}>
          <Phone className="size-3.5 opacity-80" aria-hidden="true" />
          {clinic.phone}
        </a>
      ) : null}
      {clinic.email ? (
        <a href={`mailto:${clinic.email}`} className={cn(item, "hidden hover:text-white xl:flex")}>
          <Mail className="size-3.5 opacity-80" aria-hidden="true" />
          {clinic.email.toLowerCase()}
        </a>
      ) : null}
      <span className={item}>
        <Clock className="size-3.5 opacity-80" aria-hidden="true" />
        {summarizeHours(clinic).join(" | ")}
      </span>
      <span className={item}>
        <MapPin className="size-3.5 opacity-80" aria-hidden="true" />
        Selected:
        <button
          type="button"
          onClick={onChange}
          aria-label={`Selected clinic ${clinic.shortName}. Show other clinics`}
          className="inline-flex items-center gap-1 font-semibold text-accent-aqua hover:underline focus-visible:outline-2 focus-visible:outline-white"
        >
          {clinic.shortName}
          <ChevronDown className="size-3" aria-hidden="true" />
        </button>
      </span>
    </div>
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
