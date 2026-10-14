"use client"

import { CalendarDays, MapPin, Stethoscope } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { BookingSelection } from "./types"

interface BookingSummaryProps {
  selection: BookingSelection
  providerName: string | null
  holdSeconds: number | null
}

function formatSlot(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function BookingSummary({
  selection,
  providerName,
  holdSeconds,
}: BookingSummaryProps) {
  const { location, appointmentType, slot } = selection
  const mm = holdSeconds != null ? String(Math.floor(holdSeconds / 60)).padStart(2, "0") : null
  const ss = holdSeconds != null ? String(holdSeconds % 60).padStart(2, "0") : null

  return (
    <Card className="sticky top-20 space-y-4 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Your booking
      </p>

      {location && (
        <SummaryLine icon={MapPin} label={location.name} sub={location.address} />
      )}
      {appointmentType && (
        <SummaryLine
          icon={Stethoscope}
          label={providerName ?? "First available"}
          sub={`${appointmentType.name} · ${appointmentType.default_minutes} min`}
        />
      )}
      {slot && (
        <SummaryLine icon={CalendarDays} label={formatSlot(slot.start_at)} sub="Held for you" />
      )}

      {mm != null && (
        <div className="flex items-center justify-between rounded-lg bg-accent-warm/15 px-3 py-2.5">
          <span className="text-sm font-medium text-accent-warm">Time held</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-accent-warm">
            {mm}:{ss}
          </span>
        </div>
      )}
    </Card>
  )
}

function SummaryLine({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  label: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden={true} />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}
