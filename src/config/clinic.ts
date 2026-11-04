import locationData from "@/data/locations.json";
/**
 * Seven-clinic source of truth (public facts live in src/data/locations.json).
 *
 * Only information confirmed by the clinic belongs in this file. Unknown
 * details stay null (or use an explicit `to-be-confirmed` status) so the site
 * never inherits another clinic's phone numbers, providers, or operating hours.
 */

export type DetailStatus = "confirmed" | "to-be-confirmed";

export function isConfirmed(status: DetailStatus): boolean {
  return status === "confirmed";
}

export interface LocationHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
  status: DetailStatus;
}

export interface PharmacyAction {
  label: string;
  href: string;
  description: string;
}

export interface ClinicLocation {
  id: string;
  region: string;
  doctorIds: string[];
  slug: string;
  name: string;
  shortName: string;
  walkIn: boolean;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  postalCodeStatus: DetailStatus;
  phone?: string;
  fax?: string;
  email?: string;
  contactStatus: DetailStatus;
  bookingUrl?: string;
  heroImage?: string;
  heroImageAlt?: string;
  clinicPhoto?: string;
  clinicPhotoAlt?: string;
  /** Real photos of this clinic; the first is the exterior, shown at the top of its location page. */
  photos?: { src: string; alt: string }[];
  pharmacyName?: string;
  pharmacyUrl?: string;
  pharmacyLogoSrc?: string;
  pharmacyLogoAlt?: string;
  pharmacyActions?: PharmacyAction[];
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  isComingSoon?: boolean;
  comingSoonMessage?: string;
  hours: LocationHours[];
}

export const CLINIC_CONFIG = {
  organizationName: "Valleyview Medical Centre",
  siteName: "Valleyview Medical Centre",
  market: "Durham Region, Peterborough and Brantford",
  province: "Ontario",
  country: "Canada",
  timezone: "America/Toronto",
  logoSrc: "/images/branding/vvm-logo.png",
  logoStatus: "confirmed" as const,
  domain: "valleyviewmedical.ca",
  domainStatus: "confirmed" as const,
  clinicEmail: null,
  clinicEmailStatus: "to-be-confirmed" as const,
  defaultPhone: null,
  contactStatus: "to-be-confirmed" as const,
  booking: {
    // The custom booking APIs stay disabled; public booking uses each clinic's Ocean URL.
    enabled: false,
    mode: "pending-request" as const,
    source: "ocean" as const,
    appointmentTypesStatus: "to-be-confirmed" as const,
    availabilityStatus: "to-be-confirmed" as const,
    providersStatus: "to-be-confirmed" as const,
  },
  phonePilot: {
    enabled: false,
    provider: "amazon-connect" as const,
    authorizedPatientListStatus: "to-be-confirmed" as const,
    transferNumbersStatus: "to-be-confirmed" as const,
  },
  staffAccess: {
    enabled: false,
    emailsStatus: "to-be-confirmed" as const,
  },
  aiChat: {
    enabled: true,
  },
} as const;

/**
 * Brand colours taken from the VMC logo (blue ring, lime/aqua/red figures),
 * plus a deep navy shade of the logo blue for dark surfaces.
 */
export const BRAND_PALETTE = {
  blue: "#0E68DF",
  navy: "#0B2A5B",
  lime: "#C1FF72",
  aqua: "#5CE1E6",
  red: "#D62828",
  white: "#FFFFFF",
} as const;

export const CLINIC_LOCATIONS = locationData as ClinicLocation[];

export const REGIONS = [
  { id: "durham", name: "Durham Region" },
  { id: "peterborough", name: "Peterborough" },
  { id: "brantford", name: "Brantford" },
] as const;

/**
 * Search engines may index the site only after launch is explicitly switched on
 * (VVM_ALLOW_INDEXING=true on the real domain). Review deployments, including
 * the public *.vercel.app address, always stay out of search results.
 */
export function searchIndexingAllowed(): boolean {
  return (
    process.env.VVM_ALLOW_INDEXING === "true" &&
    process.env.VERCEL_ENV !== "preview" &&
    isConfirmed(CLINIC_CONFIG.domainStatus)
  );
}

export function getConfiguredSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      // Fall back to the confirmed main domain for invalid overrides.
    }
  }

  return new URL(`https://${CLINIC_CONFIG.domain}`);
}
