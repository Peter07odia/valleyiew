"use client"

import { useSyncExternalStore } from "react"
import { Clock, MapPin, Phone } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { formatTime, getTodayHours, isLocationOpen, type ClinicLocation } from "@/lib/constants"
import { cn } from "@/lib/utils"

// Today's hours depend on the visitor's clock, so they render only in the browser.
const subscribe = () => () => {}
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false)

function Today({ location }: { location: ClinicLocation }) {
  const today = getTodayHours(location)
  if (!today || today.status !== "confirmed") return <span>Call for today&apos;s hours</span>
  if (today.isClosed) return <span className="font-semibold text-primary">Closed today</span>
  const open = isLocationOpen(location)
  return (
    <span>
      Today <span className="whitespace-nowrap font-semibold text-secondary">{formatTime(today.open)} – {formatTime(today.close)}</span>{" "}
      <span className={cn("whitespace-nowrap text-xs font-semibold", open ? "text-success" : "text-primary")}>{open ? "Open now" : "Closed now"}</span>
    </span>
  )
}

export function ClinicTodayCards() {
  const isClient = useIsClient()
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {CLINIC_LOCATIONS.map((location, index) => (
        <Reveal as="article" effect="float" delay={(index % 4) * 100} key={location.id} className="border border-secondary/15 bg-white p-6">
          <h3 className="font-serif text-2xl leading-tight text-secondary">{location.shortName}</h3>
          <p className="mt-1 text-xs italic text-muted-foreground">Call the clinic for holiday hours</p>
          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            {location.phone ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={`tel:${location.phone.replace(/\D/g, "")}`} className="font-semibold text-secondary hover:underline">
                  {location.phone}
                </a>
              </li>
            ) : null}
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {location.address}, {location.city}
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {isClient ? <Today location={location} /> : <span>Checking today&apos;s hours…</span>}
            </li>
          </ul>
        </Reveal>
      ))}
    </div>
  )
}
