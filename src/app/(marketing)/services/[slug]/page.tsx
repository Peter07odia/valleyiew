import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SERVICES } from "@/lib/constants"
import { PageHero } from "@/components/shared/page-hero"
import { ServiceDetail } from "@/components/services/service-detail"

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)

  if (!service) {
    return { title: "Service Not Found" }
  }

  return {
    title: service.name,
    description: service.fullDescription,
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)

  if (!service) {
    notFound()
  }

  return (
    <>
      <PageHero title={service.name} description={service.shortDescription} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ServiceDetail service={service} />
      </section>
    </>
  )
}
