import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { RichText } from "@/components/policies/rich-text"
import { canonicalUrl } from "@/config/clinic"
import { CLINIC_POLICIES, CLINIC_POLICIES_INTRO } from "@/data/patient-policies"

export const metadata: Metadata = {
  title: "Clinic Policies",
  description:
    "Valleyview Medical Centre clinic policies on health cards, uninsured services, test results, appointments, prescription renewals, cancellations and no-show fees.",
  alternates: { canonical: canonicalUrl("/clinic-policies") },
}

export default function ClinicPoliciesPage() {
  return (
    <>
      <PageHero title="Clinic Policies" description={CLINIC_POLICIES_INTRO} />
      <article className="mx-auto max-w-3xl space-y-12 px-5 py-16 leading-7">
        {CLINIC_POLICIES.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="mb-3 font-serif text-3xl text-secondary">{section.title}</h2>
            <div className="space-y-4">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>
                  <RichText content={paragraph} />
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </>
  )
}
