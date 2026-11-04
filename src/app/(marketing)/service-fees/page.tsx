import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarX,
  ClipboardList,
  FileText,
  FolderOpen,
  Info,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react"

import { PolicyCta } from "@/components/policies/policy-cta"
import { PolicyHero } from "@/components/policies/policy-hero"
import { Reveal } from "@/components/shared/reveal"
import { canonicalUrl } from "@/config/clinic"
import { SERVICE_FEE_GROUPS, SERVICE_FEES_INTRO } from "@/data/patient-policies"

export const metadata: Metadata = {
  title: "Uninsured Service Fees",
  description:
    "Fees at Valleyview Medical Centre for services not covered by OHIP, including sick notes, forms, driver’s medicals, TB tests and medical records.",
  alternates: { canonical: canonicalUrl("/service-fees") },
}

const GROUP_ICONS: Record<string, LucideIcon> = {
  "notes-letters": FileText,
  forms: ClipboardList,
  "exams-visits": Stethoscope,
  "tests-procedures": Syringe,
  "medical-records": FolderOpen,
  "missed-appointments": CalendarX,
}

const groupId = (id: string) => `fees-${id}`

export default function ServiceFeesPage() {
  return (
    <>
      <PolicyHero title="Uninsured Service Fees" intro={SERVICE_FEES_INTRO} currentPath="/service-fees" />

      <div className="px-5 py-16 sm:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <div className="flex items-start gap-3 border-l-4 border-primary bg-accent px-5 py-4 text-base leading-7 text-secondary">
              <Info className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <p>
                Wondering why some services have a fee? Read about{" "}
                <Link
                  href="/clinic-policies#uninsured-services"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                >
                  uninsured services
                </Link>{" "}
                and{" "}
                <Link
                  href="/clinic-policies#health-cards"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                >
                  bringing your health card
                </Link>{" "}
                in our clinic policies.
              </p>
            </div>
          </Reveal>

          <nav aria-label="Fee categories" className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Jump to a category</p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {SERVICE_FEE_GROUPS.map((group) => {
                const Icon = GROUP_ICONS[group.id] ?? FileText
                return (
                  <li key={group.id}>
                    <a
                      href={`#${groupId(group.id)}`}
                      className="inline-flex h-11 items-center gap-2 border border-secondary/20 bg-white px-4 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {group.title}
                      <span className="text-xs font-bold text-muted-foreground">{group.fees.length}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
            {SERVICE_FEE_GROUPS.map((group, index) => {
              const Icon = GROUP_ICONS[group.id] ?? FileText
              return (
                <section
                  id={groupId(group.id)}
                  key={group.id}
                  aria-labelledby={`${groupId(group.id)}-heading`}
                  className="scroll-mt-28"
                >
                  <Reveal
                    as="article"
                    effect="flip"
                    delay={(index % 2) * 120}
                    className="border border-secondary/15 bg-white shadow-[0_30px_70px_-40px_rgba(11,42,91,0.4)]"
                  >
                    <header className="flex items-center gap-4 border-b border-secondary/10 px-6 py-5">
                      <Reveal
                        as="span"
                        effect="bounce"
                        delay={(index % 2) * 120}
                        className="flex size-11 shrink-0 items-center justify-center bg-accent text-secondary"
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </Reveal>
                      <h2
                        id={`${groupId(group.id)}-heading`}
                        className="font-serif text-2xl font-medium tracking-[-0.02em] text-secondary"
                      >
                        {group.title}
                      </h2>
                    </header>
                    <table className="w-full border-collapse text-left">
                      <caption className="sr-only">{group.title} fees</caption>
                      <thead className="sr-only">
                        <tr>
                          <th scope="col">Service</th>
                          <th scope="col">Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary/10">
                        {group.fees.map((row) => (
                          <tr key={row.service} className="transition-colors hover:bg-accent/60">
                            <th scope="row" className="px-6 py-4 align-top font-normal leading-6 text-secondary/85">
                              {row.service}
                            </th>
                            <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-secondary sm:whitespace-nowrap">
                              {row.fee}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Reveal>
                </section>
              )
            })}
          </div>

          <Reveal className="mt-10">
            <Link
              href="/clinic-policies#no-show-fee"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Read our no-show and cancellation policy
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>

      <PolicyCta />
    </>
  )
}
