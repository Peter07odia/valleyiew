import { describe, expect, it } from "vitest"
import { clinicSlugForPath } from "./clinic-path"

describe("clinicSlugForPath", () => {
  it("uses the clinic named by a location page", () => {
    expect(clinicSlugForPath("/locations/whitby")).toBe("whitby")
    expect(clinicSlugForPath("/locations/brantford-colborne/")).toBe("brantford-colborne")
  })
  it("uses a doctor's clinic only when they work at one location", () => {
    expect(clinicSlugForPath("/staff/afaf-saeed")).toBe("whitby")
    expect(clinicSlugForPath("/staff/eseigbe-uwadia")).toBe("peterborough-lansdowne-mall")
    expect(clinicSlugForPath("/staff/emmanuel-olamide-adeogun")).toBeNull()
    expect(clinicSlugForPath("/staff/olajide-afolarin")).toBeNull()
  })
  it("ignores general and unknown pages", () => {
    for (const path of ["/", "/locations", "/team", "/locations/unknown", "/staff/unknown", "/locations/whitby/extra", null]) {
      expect(clinicSlugForPath(path)).toBeNull()
    }
  })
})
