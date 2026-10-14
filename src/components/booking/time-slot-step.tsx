"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DbSlot } from "./types"

interface TimeSlotStepProps {
  locationId: string
  providerId: string
  selectedSlotId: string | null
  onSlotSelect: (slot: DbSlot) => void
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WINDOW_DAYS = 14

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
function formatSlotTime(iso: string) {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ap = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, "0")} ${ap}`
}

export function TimeSlotStep({
  locationId,
  providerId,
  selectedSlotId,
  onSlotSelect,
}: TimeSlotStepProps) {
  const [slots, setSlots] = useState<DbSlot[]>([])
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null)
  const [daySelection, setDaySelection] = useState<{
    queryKey: string
    dayIndex: number
  } | null>(null)

  const days = useMemo(() => {
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    return Array.from({ length: WINDOW_DAYS }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d
    })
  }, [])

  const queryKey = `${locationId}:${providerId}`
  const loading = loadedQueryKey !== queryKey

  useEffect(() => {
    let active = true
    const from = days[0]
    const to = new Date(days[days.length - 1])
    to.setDate(to.getDate() + 1)
    const params = new URLSearchParams({
      location: locationId,
      from: from.toISOString(),
      to: to.toISOString(),
    })
    if (providerId && providerId !== "any") params.set("provider", providerId)
    fetch(`/api/booking/slots?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        setSlots(data.slots ?? [])
        setLoadedQueryKey(queryKey)
      })
      .catch(() => {
        if (!active) return
        setSlots([])
        setLoadedQueryKey(queryKey)
      })
    return () => {
      active = false
    }
  }, [locationId, providerId, days, queryKey])

  // Group slots by local day key.
  const slotsByDay = useMemo(() => {
    const map = new Map<string, DbSlot[]>()
    for (const s of slots) {
      const key = dayKey(new Date(s.start_at))
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    return map
  }, [slots])

  // When slots load, default to the first day that actually has availability,
  // so the picker never opens on a closed day (e.g. today is a weekend).
  const firstOpenIdx = useMemo(() => {
    const idx = days.findIndex((d) => (slotsByDay.get(dayKey(d)) ?? []).length > 0)
    return idx === -1 ? 0 : idx
  }, [days, slotsByDay])

  const selectedDayIndex =
    daySelection?.queryKey === queryKey
      ? daySelection.dayIndex
      : firstOpenIdx
  const selectedDay = days[selectedDayIndex]
  const daySlots = slotsByDay.get(dayKey(selectedDay)) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Pick a time</h2>
        <p className="text-sm text-muted-foreground">
          Choose an available appointment in the next two weeks.
        </p>
      </div>

      {/* Day strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((d, i) => {
          const count = (slotsByDay.get(dayKey(d)) ?? []).length
          const isSel = i === selectedDayIndex
          const closed = count === 0
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setDaySelection({ queryKey, dayIndex: i })
              }
              aria-pressed={isSel}
              className={cn(
                "flex min-w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 transition-all",
                isSel
                  ? "border-primary bg-primary text-primary-foreground"
                  : closed
                    ? "border-border bg-muted text-muted-foreground/70"
                    : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-xs opacity-80">{DAY_NAMES[d.getDay()]}</span>
              <span className="text-lg font-semibold">{d.getDate()}</span>
              {closed ? (
                <span className="text-[0.6rem] font-medium uppercase tracking-wide opacity-80">
                  Closed
                </span>
              ) : (
                <span className="text-[0.65rem] opacity-70">{MONTHS[d.getMonth()]}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Slot grid */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading availability…</p>
      ) : daySlots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          The clinic is closed on this day. Please choose another date.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {daySlots.map((s) => {
            const isSel = selectedSlotId === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSlotSelect(s)}
                aria-pressed={isSel}
                className={cn(
                  "rounded-lg border px-3 py-3 text-sm font-medium transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSel && "border-primary bg-primary text-primary-foreground"
                )}
              >
                {formatSlotTime(s.start_at)}
              </button>
            )
          })}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Selecting a time holds it for 10 minutes while you finish.
      </p>
    </div>
  )
}
