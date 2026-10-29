import { PageHero } from "@/components/shared/page-hero"
export const metadata = { title: "Careers", description: "Interested in working with Valley View Medical Group? Send us your resume." }
// Approved copy (2026-10-29): no job list, pay, requirements or application form.
export default function CareersPage(){return <><PageHero title="Careers" description="Interested in working with Valley View Medical Group? Send us your resume."/><article className="mx-auto max-w-3xl space-y-6 px-5 py-16 leading-7"><p><a href="mailto:careers@valleyviewmedical.ca" className="font-semibold text-primary underline underline-offset-4">Email your resume to careers@valleyviewmedical.ca</a></p><p>We will accommodate your needs during the hiring process. Tell us what you need.</p></article></>}
