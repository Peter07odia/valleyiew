import type { NextConfig } from "next"

type Redirect = { source: string; destination: string; permanent: true; has?: { type: "host"; value: string }[] }

// Old regional domains (with and without www) send every path to the matching page on
// the main site, or to that region's clinics when nothing matches. Destinations are
// absolute so the old hosts never loop back into their own catch-all.
const MAIN_SITE = "https://valleyviewmedical.ca"
const SHARED_PATHS = "about|blog|book|clinic-policies|contact|faq|services|team"
const SERVICE_SLUGS = "family-medicine|routine-check-ups|minor-illness-concerns|chronic-condition-support|child-adolescent-health|womens-health|vaccinations-immunizations|physicals-forms-exams|prescription-review|testing-referrals"

function hostRedirects(host: string, region: string, paths: [string, string][]): Redirect[] {
  const has = [{ type: "host" as const, value: `(?:www\\.)?${host.replace(/\./g, "\\.")}` }]
  return [
    ...paths,
    [`/:page(${SHARED_PATHS})`, "/:page"],
    [`/services/:slug(${SERVICE_SLUGS})`, "/services/:slug"],
    ["/:path*", `/locations#${region}`],
  ].map(([source, destination]) => ({ source, destination: MAIN_SITE + destination, permanent: true as const, has }))
}

export const HOST_REDIRECTS: Redirect[] = [
  ...hostRedirects("valleyviewbrantford.ca", "brantford", [
    ["/", "/locations#brantford"],
    ["/locations/lynden-road", "/locations/brantford-lynden-road"],
    ["/locations/colborne-east", "/locations/brantford-colborne"],
    ["/staff/:slug(tunde-samuel-omisore|kolawole-gbolagade)", "/staff/:slug"],
    ["/new-patient-form", "/new-patient-form"],
    ["/registration-reports", "/registration-reports"],
  ]),
  ...hostRedirects("valleyviewpeterborough.ca", "peterborough", [
    ["/", "/locations#peterborough"],
    ["/locations/lansdowne-mall", "/locations/peterborough-lansdowne-mall"],
    ["/locations/peterborough-pharmacy", "/locations/peterborough-pharmacy"],
    ["/staff/:slug(eseigbe-uwadia|babajide-olawale-odusan|henry-oghotuoma)", "/staff/:slug"],
    ["/services/walk-in-care", "/services"],
    ["/services/family-practice", "/services/family-medicine"],
    ["/services/vaccinations", "/services/vaccinations-immunizations"],
    ["/services/physicals", "/services/physicals-forms-exams"],
    ["/privacy", "/privacy-policy"],
    ["/terms", "/terms-of-service"],
    ["/accessibility", "/accessibility"],
  ]),
]

const nextConfig: NextConfig = {
  async redirects() { return [
    ...HOST_REDIRECTS,
    // Dr. Sheila Khadir no longer practises with Valleyview (2026-10-29).
    { source: "/doctors/dr-sheila-khadir", destination: "/team", permanent: true },
    { source: "/staff/sheila-khadir", destination: "/team", permanent: true },
    { source: "/pharmacy", destination: "/locations", permanent: true },
    { source: "/doctors", destination: "/team", permanent: true },
    { source: "/doctors/dr-:slug", destination: "/staff/:slug", permanent: true },
    { source: "/locations/lynden-road", destination: "/locations/brantford-lynden-road", permanent: true },
    { source: "/locations/colborne-east", destination: "/locations/brantford-colborne", permanent: true },
    { source: "/locations/lansdowne-mall", destination: "/locations/peterborough-lansdowne-mall", permanent: true },
    { source: "/policies", destination: "/clinic-policies", permanent: true },
    { source: "/service-fees", destination: "/clinic-policies", permanent: true },
    { source: "/register", destination: "/new-patient-form", permanent: true },
    { source: "/regions/:region", destination: "/locations#:region", permanent: true },
    // Original valleyviewmedical.ca paths (static backup 2026-10-13).
    { source: "/locations/brantford-1", destination: "/locations#brantford", permanent: true },
    { source: "/locations/peterborough-1", destination: "/locations#peterborough", permanent: true },
    { source: "/blog/:slug(new-registration-process|throat-infection-treatments)", destination: "/blog", permanent: true },
    { source: "/services/chronic-disease-care", destination: "/services/chronic-condition-support", permanent: true },
    { source: "/services/pediatrics", destination: "/services/child-adolescent-health", permanent: true },
    { source: "/services/physicals", destination: "/services/physicals-forms-exams", permanent: true },
    { source: "/services/vaccinations", destination: "/services/vaccinations-immunizations", permanent: true },
    { source: "/services/:slug(lab-diagnostics|specialist-referrals)", destination: "/services/testing-referrals", permanent: true },
    { source: "/services/:slug(minor-procedures|walk-in-care)", destination: "/services", permanent: true },
    { source: "/contact.php", destination: "/contact", permanent: true },
  ] },
  async headers() { return [ { source: "/:path*", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
  ] } ] },
}
export default nextConfig
