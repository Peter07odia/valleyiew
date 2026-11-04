import { describe, expect, it } from "vitest"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { locationSeo, medicalClinicJsonLd } from "./location-seo"

describe("location SEO", () => {
  it("uses unique local copy and walk-in wording for all seven clinics", () => {
    const copy = CLINIC_LOCATIONS.map(locationSeo)
    for (const field of ["title", "description", "intro"] as const) {
      expect(new Set(copy.map((seo) => seo[field])).size).toBe(7)
    }
    for (const location of CLINIC_LOCATIONS) {
      const seo = locationSeo(location)
      expect(location.walkIn).toBe(true)
      for (const text of [seo.title, seo.description, seo.intro]) {
        expect(text).toContain(location.city)
        expect(text.toLowerCase()).toContain("medical clinic")
        expect(text.toLowerCase().includes("walk-in")).toBe(location.walkIn)
        expect(text).not.toMatch(/best|\btop\b|specialist|accepting new patients/i)
      }
      expect(seo.intro).toContain("family physician")
      expect(seo.intro).toContain("Ocean")
      expect(seo.intro).toContain("registration form")
      expect(seo.url).toBe(`https://valleyviewmedical.ca/locations/${location.slug}`)
    }
  })

  it("uses registry facts including supplied coordinates", () => {
    for (const location of CLINIC_LOCATIONS) {
      const schema = medicalClinicJsonLd(location)
      expect(schema["@type"]).toBe("MedicalClinic")
      expect(schema.telephone).toBe(location.phone)
      expect(schema.address.streetAddress).toBe(location.address)
      expect(schema.address.postalCode).toBe(location.postalCode)
      expect(schema.openingHoursSpecification).toHaveLength(location.hours.filter((h) => h.status === "confirmed").length)
      expect(schema.geo).toEqual({
        "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng,
      })
      expect(typeof schema.geo?.latitude).toBe("number")
      expect(typeof schema.geo?.longitude).toBe("number")
    }
    expect(medicalClinicJsonLd({ ...CLINIC_LOCATIONS[0], lat: undefined, lng: undefined })).not.toHaveProperty("geo")
  })
})
