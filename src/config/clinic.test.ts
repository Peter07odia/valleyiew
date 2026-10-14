import { describe, it, expect } from "vitest";
import { CLINIC_LOCATIONS } from "./clinic";
import { TEAM_MEMBER_BIOS, getTeamMemberImageSrc } from "@/lib/team";
import { registrationLocationIds } from "@/lib/registration/locations";
import { existsSync } from "node:fs";
import { join } from "node:path";
describe("unified clinic content",()=>{
 it("has all seven registration identifiers and distinct booking destinations",()=>{expect(CLINIC_LOCATIONS).toHaveLength(7);expect(new Set(CLINIC_LOCATIONS.map(l=>l.bookingUrl)).size).toBe(7);expect(CLINIC_LOCATIONS.map(l=>l.id).sort()).toEqual([...registrationLocationIds].sort())});
 it("maps every clinic doctor to a sourced biography and local image",()=>{expect(TEAM_MEMBER_BIOS).toHaveLength(16);for(const l of CLINIC_LOCATIONS)for(const id of l.doctorIds){expect(TEAM_MEMBER_BIOS.some(b=>b.id===id)).toBe(true);expect(existsSync(join(process.cwd(),"public",getTeamMemberImageSrc(id)))).toBe(true)}});
 it("gives every clinic its own hero image with alt text",()=>{expect(new Set(CLINIC_LOCATIONS.map(l=>l.heroImage)).size).toBe(7);for(const l of CLINIC_LOCATIONS){expect(l.heroImageAlt).toBeTruthy();expect(existsSync(join(process.cwd(),"public",l.heroImage!))).toBe(true)}});
 it("does not present disputed weekend hours as confirmed",()=>{for(const l of CLINIC_LOCATIONS.filter(l=>["oshawa","courtice"].includes(l.id)))expect(l.hours.filter(h=>["Saturday","Sunday"].includes(h.day)).every(h=>h.status==="to-be-confirmed" && !h.open)).toBe(true)});
});
