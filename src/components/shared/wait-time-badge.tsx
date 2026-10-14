"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface WaitTimeBadgeProps {
  minutes: number
  isOpen: boolean
  size?: "default" | "lg"
}

export function WaitTimeBadge({
  minutes,
  isOpen,
  size = "default",
}: WaitTimeBadgeProps) {
  if (!isOpen) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "bg-muted text-muted-foreground",
          size === "lg" && "px-3 py-1 text-sm"
        )}
      >
        Closed
      </Badge>
    )
  }

  const status =
    minutes < 15
      ? {
          bg: "bg-success text-white shadow-[0_0_8px_oklch(0.60_0.16_155/0.4)]",
          dotColor: "bg-white",
          ringColor: "animate-ping bg-success/50",
          label: `${minutes} min`,
        }
      : minutes <= 30
        ? {
            bg: "bg-warning text-white shadow-[0_0_8px_oklch(0.75_0.15_75/0.4)]",
            dotColor: "bg-white",
            ringColor: "animate-ping bg-warning/50",
            label: `${minutes} min`,
          }
        : {
            bg: "bg-destructive text-white shadow-[0_0_8px_oklch(0.55_0.22_27/0.4)]",
            dotColor: "bg-white",
            ringColor: "animate-ping bg-destructive/50",
            label: `${minutes} min`,
          }

  return (
    <Badge
      className={cn(
        "gap-2 border-transparent font-mono font-bold",
        status.bg,
        size === "lg" && "px-3.5 py-1.5 text-sm"
      )}
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-75",
            status.ringColor
          )}
        />
        <span
          className={cn("relative inline-flex size-2 rounded-full", status.dotColor)}
        />
      </span>
      {status.label}
    </Badge>
  )
}
