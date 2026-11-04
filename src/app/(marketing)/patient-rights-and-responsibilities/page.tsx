import type { Metadata } from "next"
import { ListChecks, Lock, MessagesSquare, ShieldCheck, type LucideIcon } from "lucide-react"

import { PolicyCta } from "@/components/policies/policy-cta"
import { PolicyHero } from "@/components/policies/policy-hero"
import { RichText } from "@/components/policies/rich-text"
import { Reveal } from "@/components/shared/reveal"
import { canonicalUrl } from "@/config/clinic"
import {
  PATIENT_RESPONSIBILITIES,
  PATIENT_RESPONSIBILITIES_INTRO,
  PATIENT_RIGHTS,
  PATIENT_RIGHTS_INTRO,
} from "@/data/patient-policies"

export const metadata: Metadata = {
  title: "Patient Rights and Responsibilities",
  description:
    "Your rights as a Valleyview Medical Centre patient, including safety, respect and privacy, and what we ask of every patient who visits our clinics.",
  alternates: { canonical: canonicalUrl("/patient-rights-and-responsibilities") },
}

const RIGHT_ICONS: LucideIcon[] = [ShieldCheck, MessagesSquare, Lock]

const JUMP_LINKS = [
  { href: "#rights", label: "Your rights", Icon: ShieldCheck },
  { href: "#responsibilities", label: "Your responsibilities", Icon: ListChecks },
]

export default function PatientRightsPage() {
  return (
    <>
      <PolicyHero
        title="Patient Rights and Responsibilities"
        intro={PATIENT_RIGHTS_INTRO}
        currentPath="/patient-rights-and-responsibilities"
      />

      <nav aria-label="On this page" className="border-b border-secondary/10 bg-white px-5 sm:px-10">
        <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-8">
          {JUMP_LINKS.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                className="inline-flex h-14 items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"
              >
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="rights" aria-labelledby="rights-heading" className="scroll-mt-28 px-5 py-16 sm:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.18em] text-primary">01</p>
            <h2
              id="rights-heading"
              className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-secondary sm:text-5xl"
            >
              Your rights
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {PATIENT_RIGHTS.map((right, index) => {
              const Icon = RIGHT_ICONS[index] ?? ShieldCheck
              return (
                <Reveal
                  as="li"
                  effect="flip"
                  delay={index * 120}
                  key={right.heading}
                  className="flex flex-col border border-secondary/15 bg-white p-7 shadow-[0_30px_70px_-40px_rgba(11,42,91,0.4)]"
                >
                  <Reveal
                    as="span"
                    effect="bounce"
                    delay={index * 120}
                    className="flex size-12 items-center justify-center bg-accent text-secondary"
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </Reveal>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-secondary">{right.heading}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    <RichText content={right.body} />
                  </p>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <section
        id="responsibilities"
        aria-labelledby="responsibilities-heading"
        className="scroll-mt-28 bg-accent px-5 py-16 sm:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold tracking-[0.18em] text-primary">02</p>
            <h2
              id="responsibilities-heading"
              className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-secondary sm:text-5xl"
            >
              Your responsibilities
            </h2>
            <p className="mt-5 text-lg leading-8 text-secondary/80">{PATIENT_RESPONSIBILITIES_INTRO}</p>
          </Reveal>
          <ol className="border-y border-secondary/20">
            {PATIENT_RESPONSIBILITIES.map((item, index) => (
              <Reveal
                as="li"
                effect="flip"
                delay={(index % 3) * 120}
                key={item}
                className="grid grid-cols-[3rem_1fr] gap-4 border-b border-secondary/20 py-5 last:border-b-0"
              >
                <span className="font-serif text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-lg leading-8 text-secondary">{item}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <PolicyCta />
    </>
  )
}
