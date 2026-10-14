import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Family Practice Services",
  description:
    "Explore family medicine, preventive care, chronic-condition support, vaccinations, physicals, prescription review, and referrals at Valleyview Medical Centre.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto grid min-h-[35rem] max-w-[94rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-warm">
                Family practice services
              </p>
              <h1 className="mt-6 max-w-[10ch] font-serif text-6xl font-medium leading-[0.88] tracking-[-0.045em] sm:text-7xl">
                Care for everyday health needs.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-secondary-foreground/70">
                Our clinics provide family-practice care focused on
                prevention, ongoing health needs, and concerns that arise
                between routine visits.
              </p>
            </div>
          </div>
          <div className="relative min-h-[29rem]">
            <Image
              src="/images/brantford/comprehensive-family-care.jpg"
              alt="A family physician speaking with patients across different life stages"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-24 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid border-t border-secondary/20 md:grid-cols-2">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-secondary/20 py-7 transition-colors hover:bg-white md:px-7 md:odd:border-r"
                >
                  <span className="flex size-12 items-center justify-center bg-accent text-secondary transition-colors group-hover:bg-accent-warm">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-secondary">
                      {service.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {service.shortDescription}
                    </p>
                  </div>
                  <span className="flex flex-col items-end gap-5">
                    <span className="text-xs font-bold tracking-[0.16em] text-primary/55">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-7 max-w-3xl text-sm leading-6 text-muted-foreground">
            Exact appointment names, eligibility, clinician availability, and
            scheduling can vary by location. Emergency care is not provided
            through this website.
          </p>
        </div>
      </section>
    </>
  );
}
