import { describe, expect, it } from "vitest"
import nextConfig, { HOST_REDIRECTS } from "../../next.config"

const MAIN = "https://valleyviewmedical.ca"

// Mirrors Next.js matching closely enough for these simple patterns.
function resolve(host: string, path: string) {
  for (const r of HOST_REDIRECTS) {
    if (!r.has?.some(h => new RegExp(`^${h.value}$`).test(host))) continue
    const names: string[] = []
    const pattern = r.source
      .replace(/\/:(\w+)\*/g, (_, n) => (names.push(n), "(?:/(.*))?"))
      .replace(/:(\w+)\(([^)]+)\)/g, (_, n, alt) => (names.push(n), `(${alt})`))
    const match = new RegExp(`^${pattern}$`).exec(path)
    if (!match) continue
    return names.reduce((dest, n, i) => dest.replace(`:${n}`, match[i + 1] ?? ""), r.destination)
  }
  return null
}

describe("old domain redirects", () => {
  it("sends Brantford pages to their match and everything else to the Brantford clinics", () => {
    for (const host of ["valleyviewbrantford.ca", "www.valleyviewbrantford.ca"]) {
      expect(resolve(host, "/")).toBe(`${MAIN}/locations#brantford`)
      expect(resolve(host, "/locations/lynden-road")).toBe(`${MAIN}/locations/brantford-lynden-road`)
      expect(resolve(host, "/locations/colborne-east")).toBe(`${MAIN}/locations/brantford-colborne`)
      expect(resolve(host, "/staff/tunde-samuel-omisore")).toBe(`${MAIN}/staff/tunde-samuel-omisore`)
      expect(resolve(host, "/services/womens-health")).toBe(`${MAIN}/services/womens-health`)
      expect(resolve(host, "/new-patient-form")).toBe(`${MAIN}/new-patient-form`)
      expect(resolve(host, "/contact")).toBe(`${MAIN}/contact`)
      expect(resolve(host, "/no-such-page")).toBe(`${MAIN}/locations#brantford`)
    }
  })
  it("sends Peterborough pages to their match and everything else to the Peterborough clinics", () => {
    for (const host of ["valleyviewpeterborough.ca", "www.valleyviewpeterborough.ca"]) {
      expect(resolve(host, "/")).toBe(`${MAIN}/locations#peterborough`)
      expect(resolve(host, "/locations/lansdowne-mall")).toBe(`${MAIN}/locations/peterborough-lansdowne-mall`)
      expect(resolve(host, "/locations/peterborough-pharmacy")).toBe(`${MAIN}/locations/peterborough-pharmacy`)
      expect(resolve(host, "/services/family-practice")).toBe(`${MAIN}/services/family-medicine`)
      expect(resolve(host, "/privacy")).toBe(`${MAIN}/privacy-policy`)
      expect(resolve(host, "/blog/when-to-visit-walk-in")).toBe(`${MAIN}/locations#peterborough`)
      expect(resolve(host, "/team")).toBe(`${MAIN}/team`)
    }
  })
  it("leaves the main domain alone and redirects permanently", async () => {
    expect(resolve("valleyviewmedical.ca", "/")).toBeNull()
    expect(resolve("www.valleyviewmedical.ca", "/team")).toBeNull()
    expect(HOST_REDIRECTS.every(r => r.permanent)).toBe(true)
    const all = await nextConfig.redirects!()
    expect(all).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "www.valleyviewmedical.ca" }],
      destination: `${MAIN}/:path*`,
      statusCode: 301,
    })
    expect(all).toContainEqual({ source: "/doctors/dr-sheila-khadir", destination: "/team", permanent: true })
  })
})
