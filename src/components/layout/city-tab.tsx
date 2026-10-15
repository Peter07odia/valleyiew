"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, ChevronDown, Clock, MapPin, Navigation, Phone } from "lucide-react"

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import {
  formatTime,
  getGoogleMapsDirectionsUrl,
  getTodayHours,
  hasPublishedHours,
  isLocationOpen,
  type ClinicLocation,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

const CLOSE_DELAY_MS = 150

/** "Peterborough (Lansdowne Mall)" -> "Lansdowne Mall". */
const branchLabel = (location: ClinicLocation) => /\(([^)]+)\)/.exec(location.shortName)?.[1] ?? location.shortName

function today(location: ClinicLocation) {
  const hours = getTodayHours(location)
  if (!hasPublishedHours(location) || !hours || hours.status !== "confirmed") return { text: "Call for today's hours", open: null }
  if (hours.isClosed) return { text: "Closed today", open: false }
  return { text: `Today ${formatTime(hours.open)} – ${formatTime(hours.close)}`, open: isLocationOpen(location) }
}

/**
 * One city in the top bar. Hovering (or focusing/clicking) drops down a short
 * card per clinic in that city; single-clinic cities also switch on click.
 */
export function CityTab({
  city,
  locations,
  selectedSlug,
  onChoose,
}: {
  city: string
  locations: ClinicLocation[]
  selectedSlug: string | undefined
  onChoose: (slug: string) => void
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = locations.some(l => l.slug === selectedSlug)
  const single = locations.length === 1

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const show = () => {
    cancelClose()
    setOpen(true)
  }
  // A short delay lets the pointer travel from the tab into the card.
  const hide = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }
  useEffect(() => cancelClose, [])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-pressed={single ? active : undefined}
          aria-label={single ? city : `${city}: ${locations.length} locations`}
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onClick={() => {
            // Focus already opened the card; clicking keeps it open (and picks single-clinic cities).
            if (single) onChoose(locations[0].slug)
            show()
          }}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 border-l border-white/15 px-4 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] transition-colors first:border-l-0 focus-visible:outline-2 focus-visible:outline-white xl:px-5",
            active || open ? "text-accent-warm" : "text-white/65 hover:text-white",
          )}
        >
          {city}
          {single ? null : (
            <ChevronDown className={cn("size-3 opacity-70 transition-transform", open && "rotate-180")} aria-hidden="true" />
          )}
        </button>
      </PopoverAnchor>
      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={10}
        aria-label={`${city} ${single ? "clinic" : "clinics"}`}
        // Hover-opened cards must not pull keyboard focus away from the tabs.
        onOpenAutoFocus={event => event.preventDefault()}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={cn("gap-0 rounded-none border-0 p-0 shadow-[0_24px_60px_-28px_rgba(28,20,40,0.55)]", single ? "w-72" : "w-[34rem]")}
      >
        <p className="border-b border-secondary/10 px-4 pt-3 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {single ? `${city} clinic` : `${city} clinics`}
        </p>
        <div className={cn("grid", single ? "grid-cols-1" : "grid-cols-2 divide-x divide-secondary/10")}>
          {locations.map(location => {
            const selected = location.slug === selectedSlug
            const hours = today(location)
            return (
              <div key={location.slug} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif text-lg leading-tight text-secondary">{single ? location.shortName : branchLabel(location)}</p>
                  {selected ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Your clinic" /> : null}
                </div>
                <ul className="space-y-1.5 text-xs leading-4 text-muted-foreground">
                  <li className="flex gap-2">
                    <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {location.address}, {location.city}
                  </li>
                  {location.phone ? (
                    <li className="flex gap-2">
                      <Phone className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <a href={`tel:${location.phone.replace(/\D/g, "")}`} className="font-semibold text-secondary hover:underline">
                        {location.phone}
                      </a>
                    </li>
                  ) : null}
                  <li className="flex gap-2">
                    <Clock className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {hours.text}
                      {hours.open === null ? null : (
                        <span className={cn("ml-1.5 font-semibold", hours.open ? "text-success" : "text-primary")}>
                          {hours.open ? "Open now" : "Closed now"}
                        </span>
                      )}
                    </span>
                  </li>
                </ul>
                <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChoose(location.slug)
                      setOpen(false)
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "h-8 text-xs font-semibold transition-colors",
                      selected ? "bg-secondary text-white" : "bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    {selected ? "Your clinic" : "Choose this clinic"}
                  </button>
                  <a
                    href={getGoogleMapsDirectionsUrl(location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Directions to ${location.shortName}`}
                    className="flex h-8 items-center gap-1 px-1 text-xs font-semibold text-secondary hover:underline"
                  >
                    <Navigation className="size-3" aria-hidden="true" />
                    Directions
                  </a>
                </div>
                {location.bookingUrl ? (
                  <a
                    href={location.bookingUrl}
                    onClick={() => onChoose(location.slug)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Book an appointment →
                  </a>
                ) : null}
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
