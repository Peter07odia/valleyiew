import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Baby,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartHandshake,
  HeartPulse,
  Pill,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ClinicHero } from "@/components/home/clinic-hero";
import { LocationsShowcase } from "@/components/home/locations-showcase";
import { HomePharmacySection } from "@/components/home/home-pharmacy-section";
import { ClinicTimings } from "@/components/home/clinic-timings";
import { LocationTeamSection } from "@/components/team/location-team-section";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  alternates: { canonical: "https://valleyviewmedical.ca/" },
};

const CARE_REASONS = [
  {
    number: "01",
    title: "Care built around relationships",
    description:
      "Family practice works best when your care team understands your health history, priorities, and changing needs over time.",
  },
  {
    number: "02",
    title: "Support through every life stage",
    description:
      "From childhood and young adulthood to midlife and healthy aging, care can adapt as your health needs change.",
  },
  {
    number: "03",
    title: "Everyday and preventive care",
    description:
      "Routine visits, prevention, medication support, and new health concerns can be discussed in one familiar setting.",
  },
  {
    number: "04",
    title: "Clearer next steps",
    description:
      "When testing, specialist input, or follow-up is needed, your family-practice team helps keep the next step understandable.",
  },
] as const;

const SERVICES = [
  {
    title: "Family medicine",
    description: "Ongoing primary care for adults, children, and families.",
    icon: HeartHandshake,
  },
  {
    title: "Routine check-ups",
    description: "Periodic health reviews and conversations about prevention.",
    icon: CalendarDays,
  },
  {
    title: "Minor illness and concerns",
    description:
      "Assessment of common symptoms and non-emergency health concerns.",
    icon: Stethoscope,
  },
  {
    title: "Chronic condition support",
    description: "Monitoring and care planning for ongoing health conditions.",
    icon: Activity,
  },
  {
    title: "Children’s and adolescent health",
    description:
      "Age-appropriate care as children grow and their needs change.",
    icon: Baby,
  },
  {
    title: "Women’s health",
    description:
      "Preventive care and conversations across different life stages.",
    icon: HeartPulse,
  },
  {
    title: "Vaccinations and immunizations",
    description:
      "Routine immunization review and vaccine appointments when available.",
    icon: Syringe,
  },
  {
    title: "Physicals, forms, and medical exams",
    description:
      "Health assessments and documentation for school, work, or other needs.",
    icon: ClipboardList,
  },
  {
    title: "Prescription renewals and review",
    description:
      "Medication review and renewal requests based on clinical assessment.",
    icon: Pill,
  },
  {
    title: "Testing and specialist referrals",
    description:
      "Assessment and coordination when further investigation is appropriate.",
    icon: FileText,
  },
] as const;

const RESOURCES = [
  {
    number: "01",
    title: "Preparing for your visit",
    description:
      "Bring your health card, an up-to-date medication list, and the main questions you want to discuss. A short list helps keep your visit focused.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Prescription renewals",
    description:
      "Request renewals before medication runs out. Some prescriptions require an appointment or updated monitoring before they can be renewed.",
    icon: RefreshCw,
  },
  {
    number: "03",
    title: "Tests and referrals",
    description:
      "Your clinician will explain when testing or specialist care is appropriate. Processing times can vary, and urgent concerns should not wait for routine follow-up.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Preventive care",
    description:
      "Screening and prevention depend on age, health history, and personal risk. Ask your clinician which checks are appropriate for you.",
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Managing ongoing conditions",
    description:
      "Regular reviews can help track symptoms, medication response, and health goals. Bring home readings or recent reports when relevant.",
    icon: Activity,
  },
  {
    number: "06",
    title: "When care cannot wait",
    description:
      "For severe symptoms or a medical emergency, call 911 or go to the nearest emergency department. The website is not an emergency service.",
    icon: HeartPulse,
  },
] as const;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 overflow-x-clip bg-background">
        <ClinicHero />
        <HomePharmacySection />

        <section
          id="care"
          className="scroll-mt-28 px-5 py-24 sm:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
              <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
                <div className="absolute -left-5 -top-5 h-32 w-32 bg-accent sm:-left-8 sm:-top-8" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12rem]">
                  <Image
                    src="/images/brantford/family-care-consultation.jpg"
                    alt="A family physician speaking with a parent and child"
                    fill
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="absolute -bottom-7 right-0 max-w-[18rem] bg-primary p-6 text-white sm:right-[-2rem]">
                  <p className="font-serif text-2xl leading-tight">
                    Familiar care. Thoughtful conversations. Clear next steps.
                  </p>
                </div>
              </div>

              <Reveal className="@container pt-8 lg:pl-8 lg:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  Why patients choose Valleyview Medical Centre
                </p>
                <h2 className="mt-5 max-w-[12ch] text-balance font-serif text-5xl font-medium leading-[0.95] tracking-[-0.035em] text-secondary sm:max-w-none sm:whitespace-nowrap sm:text-[6.3cqi]">
                  Quality care, right when you need it.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Family medicine is more than a single appointment. It is a
                  place to discuss new concerns, stay ahead of preventable
                  problems, and make informed decisions about your health.
                </p>

                <div className="mt-10 grid gap-x-8 sm:grid-cols-2">
                  {CARE_REASONS.map((reason, index) => (
                    <Reveal
                      as="article"
                      key={reason.number}
                      delay={(index % 2) * 120}
                      className="border-t border-secondary/20 py-6"
                    >
                      <p className="text-xs font-bold tracking-[0.18em] text-primary">
                        {reason.number}
                      </p>
                      <h3 className="mt-3 text-lg font-bold tracking-tight text-secondary">
                        {reason.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {reason.description}
                      </p>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <ClinicTimings />

        <LocationTeamSection headingLevel="h2" />

        <section className="bg-accent">
          <div className="mx-auto grid max-w-[94rem] lg:grid-cols-2">
            <div className="relative min-h-[33rem] lg:min-h-[48rem]">
              <Image
                src="/images/brantford/new-patient-reception.jpg"
                alt="A clinic coordinator welcoming patients at reception"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[38%_center]"
              />
            </div>
            <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
              <Reveal className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  New patients welcome to register
                </p>
                <h2 className="mt-5 max-w-[11ch] text-balance font-serif text-5xl font-medium leading-[0.94] tracking-[-0.04em] text-secondary sm:text-6xl">
                  Looking for a family care physician?
                </h2>
                <p className="mt-7 text-lg leading-8 text-secondary/72">
                  Interested in joining a Valleyview family practice? Registration is open. Choose one of our seven clinics and complete our short online form. Our team will review it and contact you with next
                  steps.
                </p>
                <ol className="mt-10 space-y-0 border-y border-secondary/20">
                  {[
                    ["01", "Choose the clinic that works for you"],
                    [
                      "02",
                      "Complete the two-step form with your contact and health information",
                    ],
                    [
                      "03",
                      "The clinic reviews your registration and contacts you about next steps",
                    ],
                  ].map(([number, text], index) => (
                    <Reveal
                      as="li"
                      effect="flip"
                      delay={index * 120}
                      key={number}
                      className="grid grid-cols-[3rem_1fr] gap-4 border-b border-secondary/20 py-5 last:border-b-0"
                    >
                      <span className="font-serif text-2xl text-primary">
                        {number}
                      </span>
                      <span className="font-semibold leading-7 text-secondary">
                        {text}
                      </span>
                    </Reveal>
                  ))}
                </ol>
                <div className="mt-8 space-y-5">
                  <div className="inline-flex items-center gap-3 border-l-4 border-primary bg-white/55 px-5 py-4 text-sm leading-6 text-secondary">
                    <CalendarDays
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    Use the online registration form to send your details to
                    the clinic for review.
                  </div>
                  <div>
                    <Button
                      asChild
                      size="lg"
                      className="h-12 rounded-none px-7"
                    >
                      <Link href="/new-patient-form">
                        Register as a patient
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="scroll-mt-28 bg-white px-5 py-24 sm:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  Our service areas
                </p>
                <h2 className="mt-5 max-w-[12ch] text-balance font-serif text-5xl font-medium leading-[0.94] tracking-[-0.04em] text-secondary sm:text-6xl">
                  Comprehensive care for everyday health needs.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                  Our family practices provide care focused
                  on prevention, ongoing health needs, and concerns that arise
                  between routine visits.
                </p>
              </Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-bl-[8rem]">
                <Image
                  src="/images/brantford/comprehensive-family-care.jpg"
                  alt="A family physician speaking with patients across different life stages"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="mt-16 grid border-t border-secondary/20 md:grid-cols-2">
              {SERVICES.map(({ title, description, icon: Icon }, index) => (
                <Reveal
                  as="article"
                  key={title}
                  delay={(index % 2) * 120}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-secondary/20 py-6 md:px-6 md:odd:border-r"
                >
                  <span className="flex size-11 items-center justify-center bg-accent text-secondary transition-colors group-hover:bg-accent-warm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold tracking-tight text-secondary">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <span className="pt-1 text-xs font-bold tracking-[0.16em] text-primary/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">
              Specific appointment types and availability may vary by clinician
              and location. Emergency care is not provided through this website.
            </p>
          </div>
        </section>

        <section
          id="resources"
          className="scroll-mt-28 bg-accent px-5 py-24 sm:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <Reveal>
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  <BookOpen className="size-4" aria-hidden="true" />
                  Health resources
                </p>
                <h2 className="mt-5 max-w-[11ch] text-balance font-serif text-5xl font-medium leading-[0.94] tracking-[-0.04em] text-secondary sm:text-6xl">
                  Practical guidance for your next step.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-secondary/70">
                  Clear, useful information can make it easier to prepare for a
                  visit, manage ongoing care, and know when a concern needs more
                  urgent attention.
                </p>
              </Reveal>
              <div className="relative aspect-[4/3] overflow-hidden border-[10px] border-background shadow-[18px_18px_0_var(--primary)]">
                <Image
                  src="/images/brantford/health-resources-still-life.jpg"
                  alt="A notebook, medication organizer, and appointment folder prepared for a clinic visit"
                  fill
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="mt-20 grid gap-px overflow-hidden border border-secondary/15 bg-secondary/15 md:grid-cols-2 lg:grid-cols-3">
              {RESOURCES.map(({ number, title, description, icon: Icon }, index) => (
                <Reveal as="article" key={number} delay={(index % 3) * 120} className="bg-background p-7 sm:p-8">
                  <div className="flex items-center justify-between">
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                    <span className="font-serif text-2xl text-secondary/35">
                      {number}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold tracking-tight text-secondary">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <LocationsShowcase />

        <section className="bg-primary px-5 py-16 text-white sm:px-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <Users className="mt-1 size-7 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-serif text-3xl leading-tight sm:text-4xl">
                  Book your appointment online.
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  Choose your location to continue to your clinic’s
                  online booking page through Ocean.
                </p>
              </div>
            </div>
            <Link
              href="/book"
              className="inline-flex shrink-0 items-center gap-2 border-b border-white pb-1 text-sm font-bold"
            >
              Book an appointment
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
