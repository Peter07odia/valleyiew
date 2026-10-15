import type { Metadata } from "next"
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react"

import { ContactMap } from "@/components/contact/contact-map"
import { ContactMessageForm } from "@/components/contact/contact-message-form"
import { Reveal } from "@/components/shared/reveal"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact your Valleyview clinic in Durham Region, Peterborough or Brantford. Book online, call for same-day appointments, or send us a message.",
}

// Messages stay off until email and rate limiting are configured, and on every preview.
const messagesEnabled =
  process.env.VERCEL_ENV !== "preview" &&
  Boolean(process.env.VVM_EXPORT_RESEND_API_KEY && process.env.VVM_EXPORT_FROM_EMAIL && process.env.VVM_CHAT_RATE_LIMIT_SECRET)

export default function ContactPage() {
  return (
    <>
      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Valleyview Medical Centre</p>
            <h1 className="mt-4 font-serif text-5xl font-medium tracking-[-0.04em] text-secondary sm:text-6xl">Contact Us</h1>

            <h2 className="mt-10 font-serif text-3xl tracking-[-0.02em] text-secondary">Routine appointments</h2>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              For routine appointments, please use the online booking buttons below to book a visit at your clinic.
            </p>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              If no appointments are available online, you may also call one of the clinics listed below and our staff
              will assist you.
            </p>
            <div className="mt-6 space-y-4">
              {REGIONS.map(region => (
                <div key={region.id}>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">{region.name}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {CLINIC_LOCATIONS.filter(l => l.region === region.id && l.bookingUrl).map(l => (
                      <a
                        key={l.slug}
                        href={l.bookingUrl}
                        className="inline-flex h-11 items-center gap-2 bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
                      >
                        Book at {l.shortName}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-10 font-serif text-3xl tracking-[-0.02em] text-secondary">Same-day appointments</h2>
            <a
              href="#same-day"
              className="mt-5 inline-flex h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Call your clinic for same-day appointments
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </Reveal>

          <Reveal effect="flip" className="h-fit border border-secondary/15 bg-white p-6 shadow-[0_30px_70px_-40px_rgba(11,42,91,0.4)] sm:p-9">
            <h2 className="font-serif text-3xl tracking-[-0.02em] text-secondary">Send us a message</h2>
            <p className="mt-2 mb-6 text-sm text-muted-foreground">We&apos;ll pass it to the clinic you choose.</p>
            <ContactMessageForm preview={!messagesEnabled} />
          </Reveal>
        </div>
      </section>

      <section id="same-day" className="scroll-mt-32 bg-accent px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-4xl font-medium tracking-[-0.03em] text-secondary sm:text-5xl">Same-day appointments</h2>
            <p className="mt-4 text-lg leading-7 text-primary">
              For same-day or urgent appointment requests, select your clinic and call the number below.
            </p>
          </Reveal>
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            {CLINIC_LOCATIONS.map((l, index) => (
              <Reveal
                as="article"
                effect="flip"
                delay={(index % 4) * 100}
                key={l.slug}
                className="flex w-full flex-col items-center bg-white px-6 py-8 text-center sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.94rem)]"
              >
                <Reveal as="span" effect="bounce" delay={(index % 4) * 100}>
                  <MapPin className="size-7 text-primary" aria-hidden="true" />
                </Reveal>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-secondary">{l.shortName}</h3>
                <p className="mt-1 text-sm text-primary">Call for holiday hours</p>
                <dl className="mt-5 space-y-4 text-sm">
                  {l.phone ? (
                    <div>
                      <dt className="font-semibold text-secondary">Phone:</dt>
                      <dd>
                        <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-muted-foreground hover:text-primary hover:underline">
                          {l.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {l.fax ? (
                    <div>
                      <dt className="font-semibold text-secondary">Fax:</dt>
                      <dd className="text-muted-foreground">{l.fax}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-semibold text-secondary">Address:</dt>
                    <dd className="text-muted-foreground">
                      {l.address}
                      <br />
                      {l.city}, {l.province} {l.postalCode}
                    </dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="map-heading" className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 id="map-heading" className="sr-only">Clinic map</h2>
          <ContactMap />
        </div>
      </section>
    </>
  )
}
