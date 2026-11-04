import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Reveal } from "@/components/shared/reveal"

export function PolicyCta() {
  return (
    <section className="border-t border-secondary/10 bg-white px-5 py-16 sm:px-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Have a question?</p>
          <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-secondary sm:text-5xl">
            Your clinic can help.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
            If you have a question about any of these policies or fees, please contact your clinic.
          </p>
        </Reveal>
        <Reveal effect="flip" delay={120} className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center gap-2 bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Contact your clinic
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/locations"
            className="inline-flex h-12 items-center gap-2 border border-secondary/20 px-6 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            <MapPin className="size-4" aria-hidden="true" />
            Find a location
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
