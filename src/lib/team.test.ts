import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { SUPPORT_PROFILES, SUPPORT_TEAM_MEMBERS, TEAM_LOCATIONS, TEAM_MEMBER_BIOS, WOMENS_HEALTH_FOCUS, getDoctorAreasOfFocus, getDoctorBio, getDoctorPhoto, getTeamBio, getTeamMemberImageSrc } from "./team"

const clinicIds = CLINIC_LOCATIONS.map(location => location.id)

describe("support team", () => {
  it("assigns every staff member to real clinics with an existing photo", () => {
    for (const member of SUPPORT_TEAM_MEMBERS) {
      expect(member.locationIds.length).toBeGreaterThan(0)
      expect(member.locationIds.every(id => clinicIds.includes(id))).toBe(true)
      expect(existsSync(join(process.cwd(), "public", member.image))).toBe(true)
    }
  })
  it("links staff profiles only to biographies that exist", () => {
    expect(SUPPORT_PROFILES.map(profile => profile.id).sort()).toEqual(["hetal-bhalala", "husban-ahmed", "kashif-alavi", "musab-waseem"])
    for (const member of SUPPORT_TEAM_MEMBERS.filter(m => m.profileId)) {
      const bio = getTeamBio(member.profileId!)
      expect(bio?.paragraphs.length).toBeGreaterThan(0)
      expect(existsSync(join(process.cwd(), "public", getTeamMemberImageSrc(member.profileId!)))).toBe(true)
    }
  })
  it("shows only the groups each clinic actually has", () => {
    const groups = Object.fromEntries(TEAM_LOCATIONS.map(team => [team.locationSlug, team.sections.map(section => section.title)]))
    expect(groups.whitby).toEqual(["Doctors", "Administrative Team", "Pharmacists", "Management Team"])
    expect(groups["peterborough-lansdowne-mall"]).toEqual(["Doctors", "Administrative Team", "Management Team"])
    expect(groups["brantford-colborne"]).toEqual(["Doctors"])
  })
})

describe("doctor profiles", () => {
  it("shows the placeholder for doctors without a photo and uses the supplied Adekeye photo", () => {
    expect(getDoctorPhoto("rashida-anike-agoro")).toBeNull()
    expect(getDoctorPhoto("sidra-saif")).toBeNull()
    expect(getDoctorPhoto("olajide-afolarin")).toBeNull()
    expect(getDoctorPhoto("olalekan-adekeye")).toBe("/doctors/olalekan-adekeye.jpg")
    expect(getDoctorBio("olalekan-adekeye")?.imageAlt).toBeTruthy()
  })
  it("lists areas of focus from the data, women's health first when set", () => {
    for (const bio of TEAM_MEMBER_BIOS.filter(b => !["shehla-qadeer", "rubayat-hussain"].includes(b.id))) {
      expect(getDoctorAreasOfFocus(bio)).toEqual(expect.arrayContaining(["Diabetes care", "Mental health"]))
    }
    expect(getDoctorAreasOfFocus(getDoctorBio("mohsina-ashraf")!)[0]).toBe(WOMENS_HEALTH_FOCUS)
    for (const id of ["afaf-saeed", "maren-preussler", "mohsina-ashraf"]) {
      expect(getDoctorAreasOfFocus(getDoctorBio(id)!)).toEqual(expect.arrayContaining(["Weight management", "Skin care"]))
    }
  })
  it("no longer mentions Pashto for Dr. Afaf Saeed", () => {
    expect(JSON.stringify(getDoctorBio("afaf-saeed"))).not.toMatch(/pashto/i)
  })
})
