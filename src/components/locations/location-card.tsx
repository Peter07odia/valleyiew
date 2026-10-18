"use client"
import Link from "next/link"
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Mail,
  FileText,
  Sparkles,
} from "lucide-react"

import type { ClinicLocation } from "@/lib/constants"
import {
  formatLocationAddress,
  formatTime,
  getGoogleMapsDirectionsUrl,
  getTodayHours,
  isLocationOpen,
} from "@/lib/constants"
import { CLINIC_CONFIG } from "@/config/clinic"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LocationCardProps {
  location: ClinicLocation
  waitMinutes?: number
}

export function LocationCard({ location, waitMinutes }: LocationCardProps) {
  const open = isLocationOpen(location)
  const todayHours = getTodayHours(location)
  const isComingSoon = location.isComingSoon
  const hoursConfirmed = todayHours?.status === "confirmed"
  const contactConfirmed = location.contactStatus === "confirmed"
  const availabilityStatus: string = CLINIC_CONFIG.booking.availabilityStatus
  const directionsUrl = getGoogleMapsDirectionsUrl(location)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 transition-shadow duration-300 hover:shadow-lg">
      {/* Colored status header bar */}
      <div
        className={cn(
          "flex items-center justify-between px-5 py-2.5 text-sm font-medium text-white",
          isComingSoon
            ? "bg-accent-warm"
            : hoursConfirmed && open
              ? "bg-success"
              : "bg-secondary"
        )}
      >
        <span className="flex items-center gap-2">
          {isComingSoon ? (
            <Sparkles className="size-4" aria-hidden="true" />
          ) : (
            <span
              className="size-2 rounded-full bg-white/80"
              aria-hidden="true"
            />
          )}
          {isComingSoon
            ? "Coming Soon"
            : hoursConfirmed
              ? open
                ? "Open Now"
                : "Closed Now"
              : "Call for current hours"}
        </span>
        {availabilityStatus === "confirmed" &&
          typeof waitMinutes === "number" && (
            <Badge
              variant="secondary"
              className="bg-white/20 text-white text-xs"
            >
              <Clock className="size-3" aria-hidden="true" />
              ~{waitMinutes} min wait
            </Badge>
          )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="text-xl font-semibold text-foreground">
          {location.name}
        </h3>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <address className="not-italic">
              {formatLocationAddress(location)}
              {location.postalCodeStatus !== "confirmed" ? (
                <span className="mt-1 block">Postal code: To be confirmed</span>
              ) : null}
            </address>
          </div>

          {/* Phone */}
          {contactConfirmed && location.phone ? (
            <div className="flex items-center gap-3">
              <Phone
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href={`tel:${location.phone.replace(/-/g, "")}`}
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {location.phone}
              </a>
            </div>
          ) : null}

          {contactConfirmed && location.email ? (
            <div className="flex items-center gap-3">
              <Mail
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href={`mailto:${location.email}`}
                className="truncate font-medium text-foreground transition-colors hover:text-primary"
              >
                {location.email}
              </a>
            </div>
          ) : null}

          {contactConfirmed && location.fax ? (
            <div className="flex items-center gap-3">
              <FileText
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">
                Fax: {location.fax}
              </span>
            </div>
          ) : null}

          {!contactConfirmed ? (
            <div className="flex items-center gap-3">
              <Phone
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">
                Contact details: To be confirmed
              </span>
            </div>
          ) : null}

          {/* Today's hours */}
          <div className="flex items-center gap-3">
            <Clock
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">
              {isComingSoon ? (
                "Hours coming soon"
              ) : !hoursConfirmed || todayHours?.status !== "confirmed" ? (
                "Call for current hours"
              ) : todayHours ? (
                todayHours.isClosed ? (
                  "Today: Closed"
                ) : (
                  <>
                    Today: {formatTime(todayHours.open)} &ndash;{" "}
                    {formatTime(todayHours.close)}
                  </>
                )
              ) : (
                "Hours unavailable"
              )}
            </span>
          </div>
          {isComingSoon && location.comingSoonMessage ? (
            <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs leading-relaxed text-foreground">
              {location.comingSoonMessage}
            </p>
          ) : null}
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" asChild>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Get Directions
              </a>
            </Button>
            {location.bookingUrl ? (
              <Button size="lg" className="flex-1" asChild>
                <a
                  href={location.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Here
                </a>
              </Button>
            ) : contactConfirmed && location.phone ? (
              <Button size="lg" className="flex-1" asChild>
                <a href={`tel:${location.phone.replace(/[^0-9]/g, "")}`}>
                  Call Clinic
                </a>
              </Button>
            ) : (
              <Button size="lg" className="flex-1" asChild>
                <Link href="/book">Booking Details</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hover gradient bottom accent */}
      <div
        className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-accent-warm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </div>
  )
}
