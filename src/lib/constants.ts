import {
  FamilyPracticeIcon,
  HealthTipsIcon,
  PediatricsIcon,
  PhysicalsIcon,
  PreventionIcon,
  VaccinationsIcon,
  WalkInCareIcon,
  type AppIcon,
} from "@/components/icons/medical-icons";
import {
  CLINIC_CONFIG,
  CLINIC_LOCATIONS,
  type ClinicLocation,
  type LocationHours,
} from "@/config/clinic";

export type {
  ClinicLocation,
  LocationHours,
  PharmacyAction,
} from "@/config/clinic";

// ─── Booking Toggle ──────────────────────────────────────────────
// Custom online booking stays disabled; each clinic books through its own Ocean page.
export const BOOKING_ENABLED = CLINIC_CONFIG.booking.enabled;

// Contact numbers are location-specific; never route one clinic's calls to another.
export const DEFAULT_BOOKING_PHONE = CLINIC_CONFIG.defaultPhone;

export const BOOKING_CTA_LABEL = "Booking Details";

// ─── Location Data ───────────────────────────────────────────────

export const LOCATIONS: ClinicLocation[] = CLINIC_LOCATIONS;

// ─── Services ────────────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  icon: AppIcon;
  category: "primary" | "preventive" | "specialized";
  sortOrder: number;
}

// Shared family-practice scope across the Valleyview clinics. Exact
// appointment names, durations, providers, and availability remain separate
// scheduling details and are not implied by this public-facing catalogue.
export const SERVICES: ServiceItem[] = [
  {
    id: "family-medicine",
    slug: "family-medicine",
    name: "Family Medicine",
    shortDescription:
      "Ongoing primary care for adults, children, and families through every life stage.",
    fullDescription:
      "Family medicine provides a familiar place to discuss new concerns, review ongoing conditions, plan preventive care, and make informed decisions about your health. Your clinician considers your health history, current needs, and appropriate next steps at each visit.",
    icon: FamilyPracticeIcon,
    category: "primary",
    sortOrder: 1,
  },
  {
    id: "routine-check-ups",
    slug: "routine-check-ups",
    name: "Routine Check-Ups",
    shortDescription:
      "Periodic health reviews and preventive conversations based on your needs.",
    fullDescription:
      "Routine check-ups create time to review changes in your health, medications, lifestyle, and preventive-care needs. The timing and focus depends on your age, medical history, and individual risk factors.",
    icon: PreventionIcon,
    category: "preventive",
    sortOrder: 2,
  },
  {
    id: "minor-illness-concerns",
    slug: "minor-illness-concerns",
    name: "Minor Illness and Concerns",
    shortDescription:
      "Assessment of common symptoms and non-emergency health concerns.",
    fullDescription:
      "Family-practice visits can assess common symptoms and non-emergency health concerns, recommend appropriate treatment, and identify when testing or a higher level of care is needed. Severe or rapidly worsening symptoms require urgent or emergency care.",
    icon: WalkInCareIcon,
    category: "primary",
    sortOrder: 3,
  },
  {
    id: "chronic-condition-support",
    slug: "chronic-condition-support",
    name: "Chronic Condition Support",
    shortDescription:
      "Monitoring and care planning for ongoing health conditions.",
    fullDescription:
      "Regular follow-up can help monitor symptoms, review medication response, discuss test results, and adjust a care plan over time. Bring relevant home readings, medication details, and recent reports when requested.",
    icon: HealthTipsIcon,
    category: "primary",
    sortOrder: 4,
  },
  {
    id: "child-adolescent-health",
    slug: "child-adolescent-health",
    name: "Children’s and Adolescent Health",
    shortDescription:
      "Age-appropriate care as children grow and their health needs change.",
    fullDescription:
      "Family-practice care for children and adolescents can include growth and development conversations, preventive care, common health concerns, and guidance for parents or caregivers. Care is tailored to the child’s age and individual needs.",
    icon: PediatricsIcon,
    category: "specialized",
    sortOrder: 5,
  },
  {
    id: "womens-health",
    slug: "womens-health",
    name: "Women’s Health",
    shortDescription:
      "Preventive care and health conversations across different life stages.",
    fullDescription:
      "Women’s health visits may address preventive screening, reproductive and sexual health, menstrual or menopausal concerns, and other primary-care needs. Your clinician will recommend care based on your history, goals, and symptoms.",
    icon: PreventionIcon,
    category: "specialized",
    sortOrder: 6,
  },
  {
    id: "vaccinations-immunizations",
    slug: "vaccinations-immunizations",
    name: "Vaccinations and Immunizations",
    shortDescription:
      "Routine immunization review and vaccine appointments when available.",
    fullDescription:
      "Your family-practice team can review routine immunization needs and discuss vaccines that may be appropriate based on age, medical history, risk, and Ontario guidance. Vaccine supply and appointment availability may vary.",
    icon: VaccinationsIcon,
    category: "preventive",
    sortOrder: 7,
  },
  {
    id: "physicals-forms-exams",
    slug: "physicals-forms-exams",
    name: "Physicals, Forms, and Medical Exams",
    shortDescription:
      "Health assessments and documentation for school, work, or other needs.",
    fullDescription:
      "Medical exams and forms may be completed for school, work, licensing, insurance, or other purposes after an appropriate clinical assessment. Some forms and uninsured services may have separate fees that should be confirmed with the clinic.",
    icon: PhysicalsIcon,
    category: "preventive",
    sortOrder: 8,
  },
  {
    id: "prescription-review",
    slug: "prescription-review",
    name: "Prescription Renewals and Review",
    shortDescription:
      "Medication review and renewal requests based on clinical assessment.",
    fullDescription:
      "Medication reviews help confirm that treatment remains appropriate, effective, and safe. Request renewals before medication runs out; some prescriptions require an appointment, monitoring, or updated testing before they can be renewed.",
    icon: HealthTipsIcon,
    category: "primary",
    sortOrder: 9,
  },
  {
    id: "testing-referrals",
    slug: "testing-referrals",
    name: "Testing and Specialist Referrals",
    shortDescription:
      "Assessment and coordination when further investigation is appropriate.",
    fullDescription:
      "When your clinician determines that testing or specialist input is appropriate, the clinic can coordinate the next step and explain expected follow-up. Processing and specialist wait times vary, and urgent concerns should not wait for a routine referral.",
    icon: PhysicalsIcon,
    category: "specialized",
    sortOrder: 10,
  },
];

// ─── Testimonials ────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  patientName: string;
  location: string;
  rating: number;
  content: string;
}

export const TESTIMONIALS: Testimonial[] = [];

// ─── Trust Badges ────────────────────────────────────────────────

export const TRUST_BADGES = [
  "Seven Ontario Clinics",
  "Same Valleyview Identity",
] as const;

// ─── Navigation ──────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Locations", href: "/locations" },
  { label: "Team", href: "/team" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

// Clinic social accounts have not been confirmed.
export const SOCIAL_LINKS: Array<{
  label: string;
  href: string;
  shortLabel: string;
  iconSrc: string;
}> = [];

// ─── Blog (placeholder data) ─────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverImage: string;
  coverImageAlt: string;
  readTime: string;
}

export const BLOG_POSTS: BlogPost[] = [];

// ─── FAQ ─────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [];

// ─── Policies ────────────────────────────────────────────────────

export interface ClinicPolicyItem {
  slug: string;
  title: string;
  iconKey:
    | "health-card"
    | "uninsured-services"
    | "test-results"
    | "respectful-workplace"
    | "medical-appointments"
    | "check-in"
    | "prescription-renewal"
    | "cancellation"
    | "no-show-fee"
    | "patient-responsibility"
    | "patient-rights";
  summary: string;
  body: string[];
}

// Clinic policies require review; no branch policy is inherited.
export const CLINIC_POLICIES: ClinicPolicyItem[] = [];

export interface UninsuredServiceFee {
  service: string;
  costRange: string;
}

// Uninsured-service fees have not been approved.
export const UNINSURED_SERVICE_FEES: UninsuredServiceFee[] = [];

// ─── Helpers ─────────────────────────────────────────────────────

export function isLocationOpen(location: ClinicLocation): boolean {
  if (!hasPublishedHours(location)) return false;

  const now = getClinicClock();
  const todayHours = location.hours.find((h) => h.day === now.weekday);
  if (!todayHours || todayHours.status !== "confirmed" || todayHours.isClosed) return false;

  const [openH, openM] = todayHours.open.split(":").map(Number);
  const [closeH, closeM] = todayHours.close.split(":").map(Number);
  const currentMinutes = now.hour * 60 + now.minute;
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function hasPublishedHours(location: ClinicLocation): boolean {
  return location.hours.some(
    (hours) => hours.status === "confirmed" && !hours.isClosed && Boolean(hours.open) && Boolean(hours.close),
  );
}

export function formatLocationAddress(location: ClinicLocation): string {
  const locality = [
    location.city,
    [location.province, location.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return [location.address, locality].filter(Boolean).join(", ");
}

export function getGoogleMapsDirectionsUrl(location: ClinicLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    formatLocationAddress(location),
  )}`;
}

export function getTodayHours(
  location: ClinicLocation,
): LocationHours | undefined {
  const { weekday } = getClinicClock();
  return location.hours.find((h) => h.day === weekday);
}

function getClinicClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_CONFIG.timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    weekday: value("weekday"),
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

/** "09:00" -> "9AM", "19:30" -> "7:30PM". */
export function formatCompactTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${m.toString().padStart(2, "0")}` : ""}${h >= 12 ? "PM" : "AM"}`;
}

/**
 * Weekly hours with consecutive matching days merged, e.g.
 * ["Mon–Fri 9AM–7PM", "Sat–Sun 10AM–3PM"]. Unconfirmed days read "Call".
 */
export function summarizeHours(location: ClinicLocation): string[] {
  const label = (h: LocationHours) =>
    h.status !== "confirmed" ? "Call" : h.isClosed || !h.open ? "Closed" : `${formatCompactTime(h.open)}–${formatCompactTime(h.close)}`;
  const runs: { first: string; last: string; text: string }[] = [];
  for (const h of location.hours) {
    const text = label(h);
    const day = h.day.slice(0, 3);
    const run = runs.at(-1);
    if (run && run.text === text) run.last = day;
    else runs.push({ first: day, last: day, text });
  }
  return runs.map(r => `${r.first === r.last ? r.first : `${r.first}–${r.last}`} ${r.text}`);
}
