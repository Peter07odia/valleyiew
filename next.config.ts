import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  async redirects() { return [
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
    { source: "/staff/hetal-bhalala", destination: "/team", permanent: true },
    { source: "/blog/:slug(new-registration-process|throat-infection-treatments)", destination: "/blog", permanent: true },
    { source: "/services/chronic-disease-care", destination: "/services/chronic-condition-support", permanent: true },
    { source: "/services/pediatrics", destination: "/services/child-adolescent-health", permanent: true },
    { source: "/services/physicals", destination: "/services/physicals-forms-exams", permanent: true },
    { source: "/services/vaccinations", destination: "/services/vaccinations-immunizations", permanent: true },
    { source: "/services/:slug(lab-diagnostics|specialist-referrals)", destination: "/services/testing-referrals", permanent: true },
    { source: "/services/:slug(minor-procedures|walk-in-care)", destination: "/services", permanent: true },
  ] },
  async headers() { return [ { source: "/:path*", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
  ] } ] },
}
export default nextConfig
