import durhamDoctors from "@/data/durham-doctors.json"
import regionalDoctors from "@/data/regional-doctors.json"
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
}

export interface TeamMemberAppearance {
  locationSlug: string
  locationName: string
  sectionTitle: string
  role: string
}

export const TEAM_MEMBER_IMAGE_FALLBACK = "/images/branding/vvm-logo.png"

export const TEAM_MEMBER_BIOS: TeamMemberBio[] = [...durhamDoctors, ...regionalDoctors];
export const TEAM_MEMBER_IMAGE_BY_BIO_ID: Record<string, string> = Object.fromEntries(
  [...durhamDoctors, ...regionalDoctors].map(bio => [bio.id, bio.image])
);
export const TEAM_LOCATIONS: LocationTeam[] = CLINIC_LOCATIONS.map(location => ({
  locationSlug: location.slug,
  locationName: location.shortName,
  sections: [{ title: "Doctors", members: TEAM_MEMBER_BIOS.filter(bio => location.doctorIds.includes(bio.id)).map(bio => ({ name: bio.name, role: bio.role, bioId: bio.id })) }],
}));

export function getTeamBio(id?: string) {
  if (!id) return undefined
  return TEAM_MEMBER_BIOS.find((bio) => bio.id === id)
}

export function getTeamMemberImageSrc(id?: string) {
  if (!id) return TEAM_MEMBER_IMAGE_FALLBACK
  return TEAM_MEMBER_IMAGE_BY_BIO_ID[id] ?? TEAM_MEMBER_IMAGE_FALLBACK
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
