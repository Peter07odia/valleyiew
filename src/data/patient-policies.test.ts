import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { createElement, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import ClinicPoliciesPage from "@/app/(marketing)/clinic-policies/page"
import ServiceFeesPage from "@/app/(marketing)/service-fees/page"
import PatientRightsPage from "@/app/(marketing)/patient-rights-and-responsibilities/page"
import { FOR_PATIENTS_LINKS, SiteFooter } from "@/components/layout/site-footer"

const PAGES: Record<string, ComponentType> = {
  "/clinic-policies": ClinicPoliciesPage,
  "/service-fees": ServiceFeesPage,
  "/patient-rights-and-responsibilities": PatientRightsPage,
}

const render = (component: ComponentType) => renderToStaticMarkup(createElement(component))

const SRC = path.resolve(__dirname, "..")
const CONTENT_FILE = path.join(SRC, "data", "patient-policies.ts")

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(ts|tsx|json|md|mdx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : []
  })
}

describe("CONFIRM gate (blocks go-live until the clinic answers)", () => {
  it("keeps every CONFIRM item in the single policy content file", () => {
    const offenders = sourceFiles(SRC).filter(
      (file) => file !== CONTENT_FILE && readFileSync(file, "utf8").includes("CONFIRM:"),
    )
    expect(offenders).toEqual([])
  })

  // Lists each unresolved item so the failure output doubles as the to-do list.
  const unresolved = (html: string) => html.match(/CONFIRM:[^<]*/g) ?? []

  it.each(Object.keys(PAGES))("%s renders no unresolved CONFIRM text", (route) => {
    expect(unresolved(render(PAGES[route]))).toEqual([])
  })

  it("the footer renders no unresolved CONFIRM text", () => {
    expect(unresolved(render(SiteFooter))).toEqual([])
  })
})

describe("policy pages", () => {
  it.each(Object.keys(PAGES))("%s has exactly one H1", (route) => {
    expect(render(PAGES[route]).match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it.each(Object.keys(PAGES))("%s spells the name Valleyview Medical Centre", (route) => {
    const html = render(PAGES[route])
    expect(html).not.toMatch(/Valley View|Medical Center\b/)
  })

  it("clinic policies has the ten section ids in order", () => {
    const ids = [...render(ClinicPoliciesPage).matchAll(/<section id="([^"]+)"/g)].map((m) => m[1])
    expect(ids).toEqual([
      "health-cards",
      "uninsured-services",
      "test-results",
      "respectful-workplace",
      "medical-appointments",
      "patient-check-in",
      "prescription-renewal",
      "cancellation-late-arrival",
      "no-show-fee",
      "vacation-sick-coverage",
    ])
  })

  it("patient rights page has rights and responsibilities sections", () => {
    const ids = [...render(PatientRightsPage).matchAll(/<section id="([^"]+)"/g)].map((m) => m[1])
    expect(ids).toEqual(["rights", "responsibilities"])
  })

  it("links uninsured services to the fee page and privacy to the privacy policy", () => {
    expect(render(ClinicPoliciesPage)).toContain('href="/service-fees"')
    expect(render(PatientRightsPage)).toContain('href="/privacy-policy"')
  })
})

describe("footer", () => {
  it("lists the For patients links in order, each linked once", () => {
    expect(FOR_PATIENTS_LINKS.map((link) => link.href)).toEqual([
      "/clinic-policies",
      "/service-fees",
      "/patient-rights-and-responsibilities",
      "/privacy-policy",
      "/accessibility",
      "/terms-of-service",
    ])
    const html = render(SiteFooter)
    expect(html).toContain("For patients")
    for (const { href } of FOR_PATIENTS_LINKS) {
      expect(html.split(`href="${href}"`)).toHaveLength(2)
    }
  })
})
