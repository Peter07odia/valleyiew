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
 it("publishes the confirmed hours for every clinic",()=>{const weekend:Record<string,string>={whitby:"10:00-15:00",oshawa:"10:00-15:00",courtice:"10:00-15:00","lansdowne-mall":"10:00-15:00","peterborough-pharmacy":"10:00-15:00","lynden-road":"09:00-14:00","colborne-east":"09:00-14:00"};for(const l of CLINIC_LOCATIONS)for(const h of l.hours){expect(h.status).toBe("confirmed");expect(`${h.open}-${h.close}`).toBe(["Saturday","Sunday"].includes(h.day)?weekend[l.id]:"09:00-19:00")}});
});
describe("search indexing", () => {
  it("stays off unless launch indexing is explicitly enabled outside previews", async () => {
    const { searchIndexingAllowed } = await import("./clinic");
    const set = (allow: string, env: string) => { process.env.VVM_ALLOW_INDEXING = allow; process.env.VERCEL_ENV = env; };
    set("", "production"); expect(searchIndexingAllowed()).toBe(false);
    set("true", "preview"); expect(searchIndexingAllowed()).toBe(false);
    set("true", "production"); expect(searchIndexingAllowed()).toBe(true);
    set("", "");
  });
});
