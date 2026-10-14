"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePreferredLocation } from "@/components/providers/preferred-location-provider";
import { CLINIC_CONFIG, CLINIC_LOCATIONS } from "@/config/clinic";

type ButtonProps = React.ComponentProps<typeof Button>;

interface BookCtaProps {
  /** Styling passed straight through to the underlying Button. */
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** Label shown when online booking is enabled (e.g. "Book Now"). */
  bookingLabel: string;
  /** Label shown when booking is paused and a confirmed phone is available. */
  callLabel?: string;
  /** Called when the user activates the CTA (e.g. to close a nav sheet). */
  onActivate?: () => void;
  /** Hide the leading icon (some compact placements don't want it). */
  hideIcon?: boolean;
}

/**
 * Global booking call-to-action.
 *
 * - Uses the selected clinic's Ocean link, or /book to choose a clinic.
 * - When custom booking is enabled, links to the /book flow.
 * - When booking is paused and a confirmed phone exists, uses a tel: link.
 * - When no phone is confirmed, links to the staging-safe booking details page.
 */
export function BookCta({
  className,
  variant,
  size = "lg",
  bookingLabel,
  callLabel = "Call to book",
  onActivate,
  hideIcon = false,
}: BookCtaProps) {
  const { preferredLocation, hasHydrated } = usePreferredLocation();

  const bookingEnabled: boolean = CLINIC_CONFIG.booking.enabled;
  const defaultPhone: string | null = CLINIC_CONFIG.defaultPhone;
  const defaultContactStatus: string = CLINIC_CONFIG.contactStatus;

  const externalBookingUrl = hasHydrated ? preferredLocation?.bookingUrl : null;
  const hasExternalBooking = CLINIC_LOCATIONS.some((location) => location.bookingUrl);

  if (bookingEnabled || hasExternalBooking) {
    return (
      <Button asChild size={size} variant={variant} className={className}>
        <Link href={externalBookingUrl || "/book"} onClick={onActivate}>
          {hideIcon ? null : (
            <Calendar
              className="size-4"
              aria-hidden="true"
              data-icon="inline-start"
            />
          )}
          {bookingLabel}
        </Link>
      </Button>
    );
  }

  const preferredPhone =
    hasHydrated && preferredLocation?.contactStatus === "confirmed"
      ? preferredLocation.phone
      : null;
  const phone =
    preferredPhone ||
    (defaultContactStatus === "confirmed" ? defaultPhone : null);

  if (!phone) {
    return (
      <Button asChild size={size} variant={variant} className={className}>
        <Link href="/book" onClick={onActivate}>
          {hideIcon ? null : (
            <Calendar
              className="size-4"
              aria-hidden="true"
              data-icon="inline-start"
            />
          )}
          Booking
        </Link>
      </Button>
    );
  }

  const telHref = `tel:${phone.replace(/[^0-9]/g, "")}`;

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a
        href={telHref}
        onClick={onActivate}
        aria-label={`${callLabel}: ${phone}`}
      >
        {hideIcon ? null : (
          <Phone
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
        )}
        {callLabel}
      </a>
    </Button>
  );
}
