import type { ClinicLocation } from "@/config/clinic"

// User-approved on 2026-10-14: clinics without their own address use the
// Lynden Road mailbox until they have one.
export const CONTACT_FALLBACK_EMAIL = "valleyviewlynden@gmail.com"

export function contactRecipientFor(location: Pick<ClinicLocation, "email">): string {
  const email = location.email?.trim().toLowerCase()
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : CONTACT_FALLBACK_EMAIL
}
