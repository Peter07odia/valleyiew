import { CLINIC_LOCATIONS } from "@/config/clinic"

/**
 * The clinic a page is unambiguously about, or null.
 * Location pages name their clinic; a doctor's profile implies a clinic only
 * when that doctor works at exactly one location.
 */
export function clinicSlugForPath(pathname: string | null | undefined): string | null {
  const match = /^\/(locations|staff)\/([^/?#]+)\/?$/.exec(pathname ?? "")
  if (!match) return null
  const [, section, slug] = match
  if (section === "locations") {
    return CLINIC_LOCATIONS.some(location => location.slug === slug) ? slug : null
  }
  const clinics = CLINIC_LOCATIONS.filter(location => location.doctorIds.includes(slug))
  return clinics.length === 1 ? clinics[0].slug : null
}
