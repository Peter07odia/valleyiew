import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { ServiceItem } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ServiceCardProps {
  service: ServiceItem
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Learn more about ${service.name}`}
    >
      <Card className="relative h-full overflow-hidden border-t-[3px] border-t-primary bg-card transition-all duration-300 hover:-translate-y-1 hover:border-t-accent-warm hover:shadow-lg hover:bg-gradient-to-b hover:from-primary/[0.02] hover:to-transparent">
        <CardHeader className="pb-2">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"
            aria-hidden="true"
          >
            <Icon className="size-7 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold text-secondary">
            {service.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {service.shortDescription}
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all duration-200 group-hover:gap-2.5">
            Learn more
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
