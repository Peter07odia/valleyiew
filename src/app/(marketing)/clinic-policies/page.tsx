import type { Metadata } from "next"
import {
  ArrowUp,
  CalendarClock,
  CalendarX,
  ClipboardList,
  FlaskConical,
  HeartHandshake,
  IdCard,
  Pill,
  Receipt,
  Stethoscope,
  type LucideIcon,
} from "lucide-react"

import { PolicyCta } from "@/components/policies/policy-cta"
import { PolicyHero } from "@/components/policies/policy-hero"
import { PolicyToc } from "@/components/policies/policy-toc"
import { PolicyParagraph } from "@/components/policies/rich-text"
import { Reveal } from "@/components/shared/reveal"
import { canonicalUrl } from "@/config/clinic"
import { CLINIC_POLICIES, CLINIC_POLICIES_INTRO } from "@/data/patient-policies"

export const metadata: Metadata = {
  title: "Clinic Policies",
  description:
    "Valleyview Medical Centre clinic policies on health cards, uninsured services, test results, appointments, prescription renewals, cancellations and no-show fees.",
  alternates: { canonical: canonicalUrl("/clinic-policies") },
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  "health-cards": IdCard,
  "uninsured-services": Receipt,
  "test-results": FlaskConical,
  "respectful-workplace": HeartHandshake,
  "medical-appointments": CalendarClock,
  "patient-check-in": ClipboardList,
  "prescription-renewal": Pill,
  "cancellation-late-arrival": CalendarX,
  "no-show-fee": CalendarX,
  "vacation-sick-coverage": Stethoscope,
}

const TOC_ID = "policy-contents"

export default function ClinicPoliciesPage() {
  return (
    <>
      <PolicyHero title="Clinic Policies" intro={CLINIC_POLICIES_INTRO} currentPath="/clinic-policies" />

      <div className="px-5 py-16 sm:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
          <aside>
            <PolicyToc
              id={TOC_ID}
              label="Clinic policies contents"
              items={CLINIC_POLICIES.map(({ id, title }) => ({ id, title }))}
            />
          </aside>

          <div className="max-w-3xl">
            {CLINIC_POLICIES.map((section, index) => {
              const Icon = SECTION_ICONS[section.id] ?? ClipboardList
              return (
                <section
                  id={section.id}
                  key={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-28 border-t border-secondary/20 py-12 first:border-t-0 first:pt-0"
                >
                  <Reveal>
                    <div className="flex items-center gap-4">
                      <Reveal
                        as="span"
                        effect="bounce"
                        className="flex size-12 shrink-0 items-center justify-center bg-accent text-secondary"
                      >
                        <Icon className="size-6" aria-hidden="true" />
                      </Reveal>
                      <span className="text-xs font-bold tracking-[0.18em] text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2
                      id={`${section.id}-heading`}
                      className="mt-5 font-serif text-3xl font-medium tracking-[-0.02em] text-secondary sm:text-4xl"
                    >
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-lg leading-8 text-secondary/80">
                      {section.paragraphs.map((paragraph, i) => (
                        <PolicyParagraph key={i} content={paragraph} />
                      ))}
                    </div>
                    <a
                      href={`#${TOC_ID}`}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline lg:hidden"
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                      Back to contents
                    </a>
                  </Reveal>
                </section>
              )
            })}
          </div>
        </div>
      </div>

      <PolicyCta />
    </>
  )
}
