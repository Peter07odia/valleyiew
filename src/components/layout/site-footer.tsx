import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { LOCATIONS } from "@/lib/constants";
import { CLINIC_CONFIG } from "@/config/clinic";
import { SiteLogo } from "@/components/layout/site-logo";

const bookingEnabled: boolean = CLINIC_CONFIG.booking.enabled || LOCATIONS.some((location) => location.bookingUrl);
const defaultPhone: string | null = CLINIC_CONFIG.defaultPhone;
const contactStatus: string = CLINIC_CONFIG.contactStatus;

function getBookingLink(
  enabled: boolean,
  phone: string | null,
  status: string,
) {
  if (enabled) return { label: "Book Appointment", href: "/book" };
  if (status === "confirmed" && phone) {
    return {
      label: "Call to Book",
      href: `tel:${phone.replace(/[^0-9]/g, "")}`,
    };
  }
  return { label: "Booking Details", href: "/book" };
}

const BOOKING_LINK = getBookingLink(
  bookingEnabled,
  defaultPhone,
  contactStatus,
);

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Care", href: "/#care" },
  { label: "Services", href: "/services" },
  { label: "Health Resources", href: "/#resources" },
  { label: "Locations", href: "/locations" },
  BOOKING_LINK,
];

export function SiteFooter() {
  return (
    <footer>
      {/* Main footer content */}
      <div className="relative overflow-hidden bg-gradient-to-b from-secondary to-secondary/95 text-secondary-foreground">
        {/* Subtle dot pattern background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: Branding */}
            <div className="flex flex-col gap-5">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-80"
                aria-label={`${CLINIC_CONFIG.siteName} - Home`}
              >
                <SiteLogo className="h-14" sizes="56px" />
              </Link>
              <p className="text-sm leading-relaxed text-secondary-foreground/70">
                Seven {CLINIC_CONFIG.organizationName} clinics
                in {CLINIC_CONFIG.market}. Find clinic hours, contact details,
                and online appointment booking through Ocean.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/90">
                Quick Links
              </h3>
              <nav aria-label="Footer navigation">
                <ul className="flex flex-col gap-2.5">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Column 3: Locations */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/90">
                Our Locations
              </h3>
              <p className="text-sm leading-relaxed text-secondary-foreground/70">
                Seven clinics across Durham Region, Peterborough and Brantford.
              </p>
              <Link
                href="/locations"
                className="flex w-fit items-center gap-2 text-sm font-semibold text-secondary-foreground transition-colors hover:text-primary"
              >
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                View all locations
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-secondary-foreground/50 sm:flex-row sm:px-6 lg:px-8">
            <p>
              {CLINIC_CONFIG.organizationName} &copy; {new Date().getFullYear()}
              . All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex gap-4">
              <Link href="/privacy-policy">Privacy</Link>
              <Link href="/terms-of-service">Terms</Link>
              <Link href="/accessibility">Accessibility</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
