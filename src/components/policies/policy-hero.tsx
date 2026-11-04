import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/shared/reveal"

export const PATIENT_INFO_PAGES = [
  {
    href: "/clinic-policies",
    label: "Clinic Policies",
    description: "Health cards, appointments, prescriptions and more",
  },
  {
    href: "/service-fees",
    label: "Uninsured Service Fees",
    description: "Fees for services OHIP does not cover",
  },
  {
    href: "/patient-rights-and-responsibilities",
    label: "Patient Rights and Responsibilities",
    description: "What you can expect, and what we ask of you",
  },
] as const

interface PolicyHeroProps {
  title: string
  intro?: string
  currentPath: (typeof PATIENT_INFO_PAGES)[number]["href"]
}

export function PolicyHero({ title, intro, currentPath }: PolicyHeroProps) {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16 lg:py-24">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-warm">For patients</p>
          <h1 className="mt-6 max-w-[16ch] text-balance font-serif text-5xl font-medium leading-[0.95] tracking-[-0.04em] sm:text-6xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-7 max-w-2xl text-lg leading-8 text-secondary-foreground/75">{intro}</p>
          ) : null}
        </Reveal>

        <Reveal effect="flip" delay={120}>
          <nav aria-label="Patient information pages" className="border border-white/15 bg-white/5">
            <p className="border-b border-white/15 px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-secondary-foreground/60">
              Patient information
            </p>
            <ul>
              {PATIENT_INFO_PAGES.map((page) => (
                <li key={page.href} className="border-b border-white/10 last:border-b-0">
                  <Link
                    href={page.href}
                    aria-current={page.href === currentPath ? "page" : undefined}
                    className="group flex items-start justify-between gap-4 border-l-4 border-transparent px-5 py-4 transition-colors hover:bg-white/10 aria-[current=page]:border-accent-warm aria-[current=page]:bg-white/10"
                  >
                    <span>
                      <span className="block font-semibold">{page.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-secondary-foreground/65">
                        {page.description}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 text-accent-warm transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
      </div>
    </section>
  )
}
