import { TRUST_BADGES } from "@/lib/constants"
import {
  ShieldCheck,
  MapPin,
  type LucideIcon,
} from "lucide-react"

interface BadgeConfig {
  icon: LucideIcon
  color: string
  dotColor: string
}

const BADGE_CONFIG: Record<(typeof TRUST_BADGES)[number], BadgeConfig> = {
  "Seven Ontario Clinics": {
    icon: MapPin,
    color: "text-primary",
    dotColor: "bg-primary",
  },
  "Same Valleyview Identity": {
    icon: ShieldCheck,
    color: "text-accent-warm",
    dotColor: "bg-accent-warm",
  },
}

export function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {TRUST_BADGES.map((badge) => {
        const config = BADGE_CONFIG[badge]
        const Icon = config.icon
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full ${config.dotColor}/15`}
            >
              <Icon
                className={`size-3 ${config.color}`}
                aria-hidden="true"
              />
            </span>
            {badge}
          </span>
        )
      })}
    </div>
  )
}
