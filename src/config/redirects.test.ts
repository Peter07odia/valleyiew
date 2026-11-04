import { describe, expect, it } from "vitest"
// Next's own matcher, so these checks match how the redirects behave at runtime.
import { match } from "next/dist/compiled/path-to-regexp"

import nextConfig from "../../next.config"
import sitemap from "@/app/sitemap"
import { SUPPORT_PROFILES, TEAM_MEMBER_BIOS } from "@/lib/team"

type Redirect = { source: string; destination: string; permanent?: boolean }

async function loadRedirects(): Promise<Redirect[]> {
  return (await nextConfig.redirects!()) as Redirect[]
}

const matchesSource = (redirects: Redirect[], pathname: string) =>
  redirects.filter((r) => match(r.source, { decode: decodeURIComponent })(pathname))

// First redirect Next would apply to a path, or undefined.
const firstMatch = (redirects: Redirect[], pathname: string) => matchesSource(redirects, pathname)[0]

const POLICY_REDIRECTS: [string, string][] = [
  ["/policies/cancellation-late-arrival", "/clinic-policies#cancellation-late-arrival"],
  ["/policies/health-cards", "/clinic-policies#health-cards"],
  ["/policies/medical-appointments", "/clinic-policies#medical-appointments"],
  ["/policies/no-show-fee", "/clinic-policies#no-show-fee"],
  ["/policies/patient-checkin-information", "/clinic-policies#patient-check-in"],
  ["/policies/prescription-renewal", "/clinic-policies#prescription-renewal"],
  ["/policies/prescription-renewal-policy", "/clinic-policies#prescription-renewal"],
  ["/policies/respectful-workplace", "/clinic-policies#respectful-workplace"],
  ["/policies/test-results", "/clinic-policies#test-results"],
  ["/policies/test-results-notification", "/clinic-policies#test-results"],
  ["/policies/uninsured-services", "/service-fees"],
  ["/policies/vacation-sick-coverage", "/clinic-policies#vacation-sick-coverage"],
  ["/policies/patient-rights", "/patient-rights-and-responsibilities#rights"],
  ["/policies/patient-responsibilities", "/patient-rights-and-responsibilities#responsibilities"],
  ["/policies/some-unknown-page", "/clinic-policies"],
  ["/policies", "/clinic-policies"],
  ["/staff/husban-ahmed-manager", "/staff/husban-ahmed"],
  ["/staff/kashif-alavi-manager", "/staff/kashif-alavi"],
  ["/staff/musab-waseem-admin", "/staff/musab-waseem"],
  ["/staff/musab-waseem-manager", "/staff/musab-waseem"],
]

describe("redirects", () => {
  it.each(POLICY_REDIRECTS)("%s redirects permanently to %s", async (from, to) => {
    const rule = firstMatch(await loadRedirects(), from)
    expect(rule?.destination).toBe(to)
    expect(rule?.permanent).toBe(true)
  })

  it("no longer redirects /service-fees, which is a real page", async () => {
    expect(matchesSource(await loadRedirects(), "/service-fees")).toEqual([])
  })

  it("has no redirect whose destination is itself redirected (no loops or chains)", async () => {
    const redirects = await loadRedirects()
    const chained = redirects
      .filter((r) => r.destination.startsWith("/") && !r.destination.includes(":"))
      .filter((r) => firstMatch(redirects, r.destination.split("#")[0]))
      .map((r) => r.source)
    expect(chained).toEqual([])
  })

  it("never redirects a real page", async () => {
    const redirects = await loadRedirects()
    const realPages = [
      "/clinic-policies",
      "/service-fees",
      "/patient-rights-and-responsibilities",
      ...[...TEAM_MEMBER_BIOS, ...SUPPORT_PROFILES].map((bio) => `/staff/${bio.id}`),
    ]
    expect(realPages.filter((page) => firstMatch(redirects, page))).toEqual([])
  })
})

describe("sitemap", () => {
  const paths = () => sitemap().map((entry) => new URL(entry.url).pathname)

  it("lists the policy and legal pages", () => {
    expect(paths()).toEqual(
      expect.arrayContaining([
        "/clinic-policies",
        "/service-fees",
        "/patient-rights-and-responsibilities",
        "/privacy-policy",
        "/terms-of-service",
        "/accessibility",
      ]),
    )
  })

  it("contains no redirecting URL", async () => {
    const redirects = await loadRedirects()
    expect(paths().filter((p) => firstMatch(redirects, p))).toEqual([])
  })
})
