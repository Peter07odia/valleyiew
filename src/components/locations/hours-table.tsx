import type { LocationHours } from "@/lib/constants"
import { formatTime } from "@/lib/constants"
import { CLINIC_CONFIG } from "@/config/clinic"
import { cn } from "@/lib/utils"

interface HoursTableProps {
  hours: LocationHours[]
}

function getCurrentDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_CONFIG.timezone,
    weekday: "long",
  }).format(new Date())
}

export function HoursTable({ hours }: HoursTableProps) {
  const currentDay = getCurrentDay()

  return (
    <div role="table" aria-label="Clinic hours">
      <div role="rowgroup" className="sr-only">
        <div role="row">
          <span role="columnheader">Day</span>
          <span role="columnheader">Hours</span>
        </div>
      </div>
      <div role="rowgroup" className="divide-y divide-border">
        {hours.map((entry) => {
          const isToday = entry.day === currentDay
          const isUnconfirmed =
            entry.status !== "confirmed" ||
            (!entry.isClosed && (!entry.open || !entry.close))
          return (
            <div
              key={entry.day}
              role="row"
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm",
                isToday && "bg-primary/5 font-medium"
              )}
            >
              <span role="rowheader" className="flex items-center gap-2">
                {entry.day}
                {isToday && (
                  <span className="text-xs text-primary font-normal">
                    (Today)
                  </span>
                )}
              </span>
              <span
                role="cell"
                className={cn(
                  (isUnconfirmed || entry.isClosed) && "text-muted-foreground"
                )}
              >
                {isUnconfirmed
                  ? "To be confirmed"
                  : entry.isClosed
                  ? "Closed"
                  : `${formatTime(entry.open)} \u2013 ${formatTime(entry.close)}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
