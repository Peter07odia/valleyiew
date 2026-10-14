import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { ServiceItem } from "@/lib/constants"
import { SERVICES } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"
import { BookCta } from "@/components/booking/book-cta"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface ServiceDetailProps {
  service: ServiceItem
}

function getRelatedServices(current: ServiceItem): ServiceItem[] {
  const sameCategory = SERVICES.filter(
    (s) => s.category === current.category && s.id !== current.id
  )

  if (sameCategory.length >= 2) {
    return sameCategory.slice(0, 3)
  }

  const others = SERVICES.filter(
    (s) => s.id !== current.id && !sameCategory.some((sc) => sc.id === s.id)
  )

  return [...sameCategory, ...others].slice(0, 3)
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const Icon = service.icon
  const relatedServices = getRelatedServices(service)

  return (
    <article>
      <div className="flex items-start gap-6 mb-8">
        <div
          className="w-16 h-16 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <Icon className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {service.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {service.shortDescription}
          </p>
        </div>
      </div>

      <div className="prose prose-neutral max-w-none mb-8">
        <p className="text-base leading-relaxed text-foreground">
          {service.fullDescription}
        </p>
      </div>

      <BookCta bookingLabel="Book This Service" size="lg" className="mb-12" />

      {relatedServices.length > 0 && (
        <section aria-labelledby="related-services-heading">
          <Separator className="mb-8" />
          <h2
            id="related-services-heading"
            className="text-xl font-semibold mb-6"
          >
            Related Services
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((related) => {
              const RelatedIcon = related.icon
              return (
                <Link
                  key={related.id}
                  href={`/services/${related.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                >
                  <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/30">
                    <CardHeader>
                      <div
                        className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1"
                        aria-hidden="true"
                      >
                        <RelatedIcon className="size-5" />
                      </div>
                      <CardTitle className="text-base font-semibold">
                        {related.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {related.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        View details
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </article>
  )
}
