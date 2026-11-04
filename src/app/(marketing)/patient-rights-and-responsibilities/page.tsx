import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { RichText } from "@/components/policies/rich-text"
import { canonicalUrl } from "@/config/clinic"
import {
  PATIENT_RESPONSIBILITIES,
  PATIENT_RESPONSIBILITIES_INTRO,
  PATIENT_RIGHTS,
  PATIENT_RIGHTS_INTRO,
} from "@/data/patient-policies"

export const metadata: Metadata = {
  title: { absolute: "Patient Rights and Responsibilities | Valley View Medical Centre" },
  description:
    "Your rights as a Valley View Medical Centre patient, including safety, respect and privacy, and what we ask of every patient who visits our clinics.",
  alternates: { canonical: canonicalUrl("/patient-rights-and-responsibilities") },
}

export default function PatientRightsPage() {
  return (
    <>
      <PageHero title="Patient Rights and Responsibilities" description={PATIENT_RIGHTS_INTRO} />
      <article className="mx-auto max-w-3xl space-y-12 px-5 py-16 leading-7">
        <section id="rights" className="scroll-mt-28">
          <h2 className="mb-3 font-serif text-3xl text-secondary">Your rights</h2>
          <ul className="list-disc space-y-3 pl-5">
            {PATIENT_RIGHTS.map((right) => (
              <li key={right.heading}>
                <strong>{right.heading}</strong> <RichText content={right.body} />
              </li>
            ))}
          </ul>
        </section>
        <section id="responsibilities" className="scroll-mt-28">
          <h2 className="mb-3 font-serif text-3xl text-secondary">Your responsibilities</h2>
          <p className="mb-3">{PATIENT_RESPONSIBILITIES_INTRO}</p>
          <ul className="list-disc space-y-2 pl-5">
            {PATIENT_RESPONSIBILITIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </article>
    </>
  )
}
