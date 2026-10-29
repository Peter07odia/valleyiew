import durhamDoctors from "@/data/durham-doctors.json"
import regionalDoctors from "@/data/regional-doctors.json"
import supportTeam from "@/data/support-team.json"
import { CLINIC_LOCATIONS } from "@/config/clinic"

export interface TeamMember {
  name: string
  role: string
  bioId?: string
}

export interface TeamSection {
  title: string
  members: TeamMember[]
}

export interface LocationTeam {
  locationSlug: string
  locationName: string
  sections: TeamSection[]
}

export interface TeamMemberBio {
  id: string
  name: string
  role: string
  sourceUrl?: string
  imagePosition?: string
  paragraphs: string[]
  credentials?: string[]
  interests?: string[]
}

export interface TeamMemberAppearance {
  locationSlug: string
  locationName: string
  sectionTitle: string
  role: string
}

export const TEAM_MEMBER_IMAGE_FALLBACK = "/images/branding/vvm-logo.png"

/** Doctor records from the data files. `image` is null when there is no photo. */
export interface DoctorBio extends TeamMemberBio {
  image: string | null
  imageAlt?: string
  /** Lists "Women's health" first under Areas of focus. Off unless the clinic confirms it. */
  womensHealth?: boolean
  areasOfFocus?: string[]
}

export const WOMENS_HEALTH_FOCUS = "Women's health (including gynecology, pregnancy and postpartum care)"

const DOCTORS: DoctorBio[] = [...durhamDoctors, ...regionalDoctors]

export const TEAM_MEMBER_BIOS: DoctorBio[] = DOCTORS;
export const TEAM_MEMBER_IMAGE_BY_BIO_ID: Record<string, string | null> = Object.fromEntries(
  DOCTORS.map(bio => [bio.id, bio.image])
);

// Logo stand-ins from the old sites are not photos; those doctors get the placeholder avatar.
const LOGO_IMAGES = new Set([TEAM_MEMBER_IMAGE_FALLBACK, "/images/doctors/logo.png"])

export function getDoctorBio(id?: string) {
  return id ? DOCTORS.find(bio => bio.id === id) : undefined
}

/** The doctor's photo, or null when the placeholder avatar should show. */
export function getDoctorPhoto(id: string): string | null {
  const image = TEAM_MEMBER_IMAGE_BY_BIO_ID[id]
  return image && !LOGO_IMAGES.has(image) ? image : null
}

export function getDoctorAreasOfFocus(bio: DoctorBio): string[] {
  const areas = bio.areasOfFocus ?? []
  return bio.womensHealth ? [WOMENS_HEALTH_FOCUS, ...areas] : areas
}
/** Team groups, in the order the original site's team tabs used. */
export const TEAM_CATEGORIES = [
  { id: "doctors", title: "Doctors" },
  { id: "administrative", title: "Administrative Team" },
  { id: "pharmacists", title: "Pharmacists" },
  { id: "management", title: "Management Team" },
] as const
export type TeamCategory = (typeof TEAM_CATEGORIES)[number]["id"]

export interface SupportTeamMember {
  name: string
  title: string
  category: Exclude<TeamCategory, "doctors">
  locationIds: string[]
  image: string
  profileId: string | null
}

/** Administrative, pharmacy and management staff (original site + Peterborough site). */
export const SUPPORT_TEAM_MEMBERS = supportTeam.members as SupportTeamMember[]

/** Staff with published biographies get profile pages alongside the physicians. */
export const SUPPORT_PROFILES: TeamMemberBio[] = supportTeam.profiles.map(profile => ({
  id: profile.id,
  name: profile.name,
  role: SUPPORT_TEAM_MEMBERS.find(member => member.profileId === profile.id)?.title ?? "",
  sourceUrl: profile.sourceUrl,
  paragraphs: profile.paragraphs,
}))
const SUPPORT_IMAGE_BY_PROFILE_ID = Object.fromEntries(supportTeam.profiles.map(profile => [profile.id, profile.image]))

const SECTION_TITLE = Object.fromEntries(TEAM_CATEGORIES.map(category => [category.id, category.title]))

export const TEAM_LOCATIONS: LocationTeam[] = CLINIC_LOCATIONS.map(location => ({
  locationSlug: location.slug,
  locationName: location.shortName,
  sections: [
    { title: "Doctors", members: TEAM_MEMBER_BIOS.filter(bio => location.doctorIds.includes(bio.id)).map(bio => ({ name: bio.name, role: bio.role, bioId: bio.id })) },
    ...TEAM_CATEGORIES.filter(category => category.id !== "doctors").map(category => ({
      title: SECTION_TITLE[category.id],
      members: SUPPORT_TEAM_MEMBERS.filter(member => member.category === category.id && member.locationIds.includes(location.id)).map(member => ({
        name: member.name,
        role: member.title,
        bioId: member.profileId ?? undefined,
      })),
    })),
  ].filter(section => section.members.length > 0),
}));

export function getTeamBio(id?: string) {
  if (!id) return undefined
  return TEAM_MEMBER_BIOS.find((bio) => bio.id === id) ?? SUPPORT_PROFILES.find((bio) => bio.id === id)
}

export function getTeamMemberImageSrc(id?: string) {
  if (!id) return TEAM_MEMBER_IMAGE_FALLBACK
  return TEAM_MEMBER_IMAGE_BY_BIO_ID[id] ?? SUPPORT_IMAGE_BY_PROFILE_ID[id] ?? TEAM_MEMBER_IMAGE_FALLBACK
}

export function isTeamLogoImage(src: string) {
  return src === TEAM_MEMBER_IMAGE_FALLBACK
}

export function getTeamMemberAppearances(id: string): TeamMemberAppearance[] {
  return TEAM_LOCATIONS.flatMap((team) =>
    team.sections.flatMap((section) =>
      section.members
        .filter((member) => member.bioId === id)
        .map((member) => ({
          locationSlug: team.locationSlug,
          locationName: team.locationName,
          sectionTitle: section.title,
          role: member.role,
        }))
    )
  )
}
