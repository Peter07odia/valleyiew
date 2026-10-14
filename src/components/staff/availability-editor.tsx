"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Ban,
  CalendarCheck,
  ChevronDown,
  Check,
  Copy,
  Lock,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  buildSlotPatchRequests,
  getSlotDisplayStatus,
  isSlotManageable,
  stageSlotToggle,
  type StaffSlot,
  type SlotDrafts,
} from "@/lib/booking/slot-actions"
import { formatAppointmentTime } from "@/lib/booking/dashboard-display"

interface Provider {
  id: string
  name: string
  location_id: string
}
interface AppointmentType {
  id: string
  name: string
  default_minutes: number
}
interface DayRow {
  weekday: number // 0 = Sunday
  label: string
  on: boolean
  start: string
  end: string
  slotMinutes: number
}
interface ExceptionRow {
  id: string
  date: string
  reason: string
}

// weekday index 0..6 = Sun..Sat (matches Postgres extract(dow)).
const WEEK_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_OPTIONS = (() => {
  const out: string[] = []
  for (let m = 7 * 60; m <= 18 * 60; m += 30) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    out.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`)
  }
  return out
})()
const SLOT_LENGTHS = [10, 15, 20, 30, 45, 60]
const CLINIC_TIME_ZONE = "America/Toronto"

function defaultWeek(): DayRow[] {
  // Mon–Fri open 09:00–16:00, 30-min slots; weekends off.
  return WEEK_LABELS.map((label, weekday) => ({
    weekday,
    label,
    on: weekday >= 1 && weekday <= 5,
    start: "09:00",
    end: "16:00",
    slotMinutes: 30,
  }))
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number)
  const ap = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`
}
function slotsFor(row: DayRow) {
  if (!row.on) return 0
  const [sh, sm] = row.start.split(":").map(Number)
  const [eh, em] = row.end.split(":").map(Number)
  const mins = eh * 60 + em - (sh * 60 + sm)
  return mins > 0 ? Math.floor(mins / row.slotMinutes) : 0
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function nextDateForWeekday(weekday: number) {
  const [year, month, day] = todayKey().split("-").map(Number)
  const date = new Date(year, month - 1, day, 12)
  const daysAhead = (weekday - date.getDay() + 7) % 7
  date.setDate(date.getDate() + daysAhead)
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function slotTimeKey(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso))
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00"
  return `${hour}:${minute}`
}

function slotsForRowWindow(slots: StaffSlot[], row: DayRow) {
  return slots.filter((slot) => {
    const time = slotTimeKey(slot.startAt)
    return time >= row.start && time < row.end
  })
}

export function AvailabilityEditor() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [types, setTypes] = useState<AppointmentType[]>([])
  const [providerId, setProviderId] = useState<string>("")
  const [week, setWeek] = useState<DayRow[]>(defaultWeek())
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copying, setCopying] = useState(false)
  const [lastSaved, setLastSaved] = useState<{ openSlots: number; openDays: number } | null>(null)
  const [expandedWeekday, setExpandedWeekday] = useState<number | null>(null)
  const [daySlots, setDaySlots] = useState<Record<number, StaffSlot[]>>({})
  const [slotDrafts, setSlotDrafts] = useState<Record<number, SlotDrafts>>({})
  const [slotLoading, setSlotLoading] = useState<number | null>(null)
  const [slotSaving, setSlotSaving] = useState<number | null>(null)

  // Load providers + types once.
  useEffect(() => {
    let active = true
    fetch("/api/staff/providers")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        setProviders(data.providers ?? [])
        setTypes(data.types ?? [])
        if (data.providers?.[0]) setProviderId(data.providers[0].id)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  // Load the selected provider's existing schedule.
  useEffect(() => {
    if (!providerId) return
    let active = true
    setExpandedWeekday(null)
    setDaySlots({})
    setSlotDrafts({})
    fetch(`/api/staff/availability?provider=${providerId}`)
      .then((r) => r.json())
      .then((data: { templates: TemplateRow[]; exceptions: ExceptionApiRow[] }) => {
        if (!active) return
        const base = defaultWeek().map((d) => ({ ...d, on: false }))
        for (const t of data.templates ?? []) {
          const row = base.find((d) => d.weekday === t.weekday)
          if (row) {
            row.on = true
            row.start = t.start_time.slice(0, 5)
            row.end = t.end_time.slice(0, 5)
            row.slotMinutes = t.slot_minutes
          }
        }
        // If the provider has no templates yet, fall back to a sensible default.
        setWeek(data.templates?.length ? base : defaultWeek())
        setExceptions(
          (data.exceptions ?? []).map((e) => ({
            id: e.id,
            date: e.date,
            reason: e.reason ?? "",
          }))
        )
      })
    return () => {
      active = false
    }
  }, [providerId])

  const weeklyTotal = useMemo(
    () => week.reduce((sum, d) => sum + slotsFor(d), 0),
    [week]
  )
  const providerName = providers.find((p) => p.id === providerId)?.name ?? "this doctor"

  function update(weekday: number, patch: Partial<DayRow>) {
    setWeek((w) => w.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)))
    setLastSaved(null) // unsaved changes invalidate the confirmation
    setSlotDrafts((current) => ({ ...current, [weekday]: {} }))
    if (patch.on === false) setExpandedWeekday((current) => (current === weekday ? null : current))
  }

  // Plain-English summary of what patients will be able to book.
  const scheduleSummary = useMemo(() => {
    const openDays = week.filter((d) => d.on)
    if (openDays.length === 0) return null
    // Group consecutive same-hours days into ranges (e.g. "Mon–Fri 9:00 AM–4:00 PM").
    const label = (d: DayRow) => `${fmtTime(d.start)}–${fmtTime(d.end)}`
    const allSame = openDays.every((d) => label(d) === label(openDays[0]))
    const dayNames = openDays.map((d) => d.label.slice(0, 3))
    const dayPart =
      dayNames.length > 2 && allSame ? `${dayNames[0]}–${dayNames[dayNames.length - 1]}` : dayNames.join(", ")
    return allSame ? `${dayPart}, ${label(openDays[0])}` : `${dayNames.join(", ")} (varies)`
  }, [week])

  // Save a given provider's week. Returns the API result (or null on failure).
  async function saveFor(targetProviderId: string, targetWeek: DayRow[]) {
    const res = await fetch("/api/staff/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        providerId: targetProviderId,
        appointmentTypeId: types[0]?.id ?? null,
        week: targetWeek.map(({ weekday, on, start, end, slotMinutes }) => ({
          weekday,
          on,
          start,
          end,
          slotMinutes,
        })),
        // Exceptions only apply to the provider currently being edited.
        exceptions:
          targetProviderId === providerId
            ? exceptions.filter((e) => e.date).map((e) => ({ date: e.date, reason: e.reason || undefined }))
            : [],
      }),
    })
    if (!res.ok) return null
    return (await res.json()) as { openSlots: number; openDays: number }
  }

  async function save() {
    if (!providerId) return
    setSaving(true)
    const result = await saveFor(providerId, week)
    setSaving(false)
    if (!result) {
      toast.error("Could not save the schedule. Try again.")
      return
    }
    setLastSaved({ openSlots: result.openSlots, openDays: result.openDays })
    toast.success(`Saved — ${result.openSlots} bookable slots created`)
  }

  // Apply this provider's weekly hours to every OTHER provider, then save each.
  async function copyToOthers() {
    const others = providers.filter((p) => p.id !== providerId)
    if (others.length === 0) return
    setCopying(true)
    let ok = 0
    for (const p of others) {
      const r = await saveFor(p.id, week)
      if (r) ok++
    }
    setCopying(false)
    if (ok === others.length) {
      toast.success(`Copied this schedule to ${ok} other doctor${ok === 1 ? "" : "s"}`)
    } else {
      toast.error(`Copied to ${ok} of ${others.length} doctors — some failed`)
    }
  }

  async function loadSlotsForRow(row: DayRow) {
    if (!providerId || !row.on) return

    setSlotLoading(row.weekday)
    try {
      const date = nextDateForWeekday(row.weekday)
      const res = await fetch(`/api/staff/slots?provider=${providerId}&date=${date}`)
      const data = (await res.json().catch(() => ({}))) as { slots?: StaffSlot[] }

      if (!res.ok) {
        setDaySlots((current) => ({ ...current, [row.weekday]: [] }))
        toast.error("Could not load slots for this day.")
        return
      }

      setDaySlots((current) => ({ ...current, [row.weekday]: data.slots ?? [] }))
      setSlotDrafts((current) => ({ ...current, [row.weekday]: {} }))
    } catch {
      setDaySlots((current) => ({ ...current, [row.weekday]: [] }))
      toast.error("Could not load slots for this day.")
    } finally {
      setSlotLoading((current) => (current === row.weekday ? null : current))
    }
  }

  function toggleSlotDrawer(row: DayRow) {
    if (!row.on) return

    if (expandedWeekday === row.weekday) {
      setExpandedWeekday(null)
      setSlotDrafts((current) => ({ ...current, [row.weekday]: {} }))
      return
    }

    setExpandedWeekday(row.weekday)
    void loadSlotsForRow(row)
  }

  function toggleInlineSlot(row: DayRow, slot: StaffSlot) {
    setSlotDrafts((current) => ({
      ...current,
      [row.weekday]: stageSlotToggle(current[row.weekday] ?? {}, slot),
    }))
  }

  async function patchSlots(action: "block" | "unblock", slotIds: string[]) {
    return fetch("/api/staff/slots", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, slotIds }),
    })
  }

  async function saveInlineSlotChanges(row: DayRow) {
    const slots = slotsForRowWindow(daySlots[row.weekday] ?? [], row)
    const drafts = slotDrafts[row.weekday] ?? {}
    const changes = buildSlotPatchRequests(slots, drafts)
    const total = changes.block.length + changes.unblock.length
    if (total === 0) return

    setSlotSaving(row.weekday)
    const requests: Promise<Response>[] = []
    if (changes.block.length) requests.push(patchSlots("block", changes.block))
    if (changes.unblock.length) requests.push(patchSlots("unblock", changes.unblock))

    try {
      const results = await Promise.all(requests)

      if (results.some((result) => !result.ok)) {
        toast.error("Could not save slot changes. Try again.")
        return
      }

      toast.success(`Saved ${total} slot change${total === 1 ? "" : "s"}`)
      await loadSlotsForRow(row)
    } catch {
      toast.error("Could not save slot changes. Try again.")
    } finally {
      setSlotSaving((current) => (current === row.weekday ? null : current))
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Loading availability…
      </Card>
    )
  }
  if (providers.length === 0)
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        No providers found for your location.
      </Card>
    )

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Settings className="size-4" aria-hidden="true" />
              Availability
            </div>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Weekly booking hours
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set reusable hours, then close individual dates for holidays or time off.
            </p>
          </div>
          <Badge variant="secondary">≈ {weeklyTotal} slots / week</Badge>
        </div>
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <UserRound className="size-4 text-primary" aria-hidden="true" />
            Provider
          </div>
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProviderId(p.id)
                  setLastSaved(null) // switching doctors clears the previous confirmation
                  setExpandedWeekday(null)
                  setDaySlots({})
                  setSlotDrafts({})
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  providerId === p.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Plain-English preview of what patients will see, or a warning if none. */}
      {scheduleSummary ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3">
          <CalendarCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-foreground">
            Patients can book <b>{providerName}</b>: {scheduleSummary}.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm text-amber-800">
            <b>No open days set.</b> Patients can&apos;t book {providerName} until you
            turn on at least one day and save.
          </p>
        </div>
      )}

      <Card className="divide-y divide-border overflow-hidden p-0">
        {week.map((row) => {
          const expanded = expandedWeekday === row.weekday
          const rowSlots = slotsForRowWindow(daySlots[row.weekday] ?? [], row)
          const rowDrafts = slotDrafts[row.weekday] ?? {}
          const pendingCount = Object.keys(rowDrafts).length

          return (
            <div
              key={row.weekday}
              className={cn("divide-y divide-border", !row.on && "bg-muted/40")}
            >
              <div className="grid gap-3 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:items-center">
                <button
                  type="button"
                  onClick={() => update(row.weekday, { on: !row.on })}
                  className="flex items-center gap-3 text-left"
                  aria-pressed={row.on}
                >
                  <span
                    className={cn(
                      "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                      row.on ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
                        row.on ? "left-4" : "left-0.5"
                      )}
                    />
                  </span>
                  <span className={cn("text-sm font-medium", row.on ? "text-foreground" : "text-muted-foreground")}>
                    {row.label}
                  </span>
                </button>

                {row.on ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <TimeSelect
                      value={row.start}
                      onChange={(v) => update(row.weekday, { start: v })}
                      options={TIME_OPTIONS}
                      ariaLabel={`${row.label} start time`}
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <TimeSelect
                      value={row.end}
                      onChange={(v) => update(row.weekday, { end: v })}
                      options={TIME_OPTIONS.filter((t) => t > row.start)}
                      ariaLabel={`${row.label} end time`}
                    />
                    <span className="text-sm text-muted-foreground">slots</span>
                    <select
                      value={row.slotMinutes}
                      onChange={(e) => update(row.weekday, { slotMinutes: Number(e.target.value) })}
                      aria-label={`${row.label} slot length`}
                      className="h-8 rounded-md border border-border bg-card px-2 text-sm"
                    >
                      {SLOT_LENGTHS.map((s) => (
                        <option key={s} value={s}>
                          {s} min
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleSlotDrawer(row)}
                      className={cn(
                        "ml-auto inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors",
                        "hover:bg-secondary/85 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      )}
                      aria-expanded={expanded}
                      aria-controls={`weekday-slots-${row.weekday}`}
                    >
                      {slotsFor(row)} slots
                      <ChevronDown
                        className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-muted-foreground">
                    Closed — tap the toggle to open this day
                  </span>
                )}
              </div>

              {expanded && row.on && (
                <InlineSlotDrawer
                  id={`weekday-slots-${row.weekday}`}
                  row={row}
                  date={nextDateForWeekday(row.weekday)}
                  slots={rowSlots}
                  drafts={rowDrafts}
                  loading={slotLoading === row.weekday}
                  saving={slotSaving === row.weekday}
                  pendingCount={pendingCount}
                  onToggle={(slot) => toggleInlineSlot(row, slot)}
                  onSave={() => void saveInlineSlotChanges(row)}
                />
              )}
            </div>
          )
        })}
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Exceptions</p>
          <p className="text-sm text-muted-foreground">
            Close specific dates (holidays, time off). These override weekly hours.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExceptions((e) => [...e, { id: crypto.randomUUID(), date: "", reason: "" }])}
        >
          <Plus className="size-4" /> Add date
        </Button>
      </div>

      <div className="space-y-2.5">
        {exceptions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            No closed dates set.
          </div>
        ) : (
          exceptions.map((ex) => (
            <Card key={ex.id} className="flex flex-wrap items-end gap-3 p-3.5">
              <div className="w-44 space-y-1">
                <label className="text-xs font-medium text-foreground">Date to close</label>
                <Input
                  type="date"
                  value={ex.date}
                  onChange={(e) =>
                    setExceptions((list) => list.map((x) => (x.id === ex.id ? { ...x, date: e.target.value } : x)))
                  }
                />
              </div>
              <div className="min-w-44 flex-1 space-y-1">
                <label className="text-xs font-medium text-foreground">Reason</label>
                <Input
                  placeholder="e.g. Vacation"
                  value={ex.reason}
                  onChange={(e) =>
                    setExceptions((list) => list.map((x) => (x.id === ex.id ? { ...x, reason: e.target.value } : x)))
                  }
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setExceptions((list) => list.filter((x) => x.id !== ex.id))}
                className="text-destructive hover:text-destructive"
                aria-label="Remove exception"
              >
                <Trash2 className="size-4" />
              </Button>
            </Card>
          ))
        )}
      </div>

      {/* Save confirmation — shows after a successful save until the next edit. */}
      {lastSaved && (
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-foreground">
            <b>Saved.</b> {lastSaved.openSlots} bookable slots created for{" "}
            {providerName} over the next 60 days
            {scheduleSummary ? ` (${scheduleSummary})` : ""}. These are live on the
            booking page now.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving || copying}>
          <Check className="size-4" /> {saving ? "Saving…" : "Save schedule"}
        </Button>
        {providers.length > 1 && (
          <Button
            variant="outline"
            onClick={copyToOthers}
            disabled={saving || copying}
            title="Apply these same weekly hours to every other doctor"
          >
            <Copy className="size-4" />
            {copying ? "Copying…" : `Copy hours to other doctors`}
          </Button>
        )}
      </div>
    </div>
  )
}

interface TemplateRow {
  weekday: number
  start_time: string
  end_time: string
  slot_minutes: number
}
interface ExceptionApiRow {
  id: string
  date: string
  reason: string | null
}

function TimeSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  ariaLabel: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="h-8 rounded-md border border-border bg-card px-2 text-sm"
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {fmtTime(t)}
        </option>
      ))}
    </select>
  )
}

function InlineSlotDrawer({
  id,
  row,
  date,
  slots,
  drafts,
  loading,
  saving,
  pendingCount,
  onToggle,
  onSave,
}: {
  id: string
  row: DayRow
  date: string
  slots: StaffSlot[]
  drafts: SlotDrafts
  loading: boolean
  saving: boolean
  pendingCount: number
  onToggle: (slot: StaffSlot) => void
  onSave: () => void
}) {
  const counts = slots.reduce(
    (acc, slot) => {
      const status = getSlotDisplayStatus(slot, drafts)
      if (status === "open") acc.open += 1
      else if (status === "blocked") acc.blocked += 1
      else acc.taken += 1
      return acc
    },
    { open: 0, blocked: 0, taken: 0 }
  )

  return (
    <div id={id} className="bg-muted/20 px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {row.label} {date} · {fmtTime(row.start)} to {fmtTime(row.end)}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="bg-background">
            {counts.open} open
          </Badge>
          <Badge variant="outline" className="bg-background">
            {counts.blocked} blocked
          </Badge>
          {counts.taken > 0 && (
            <Badge variant="outline" className="bg-background">
              {counts.taken} booked
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="secondary">
              {pendingCount} unsaved
            </Badge>
          )}
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving || pendingCount === 0}
            className="ml-1"
          >
            <Check className="size-3.5" />
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-3 text-sm text-muted-foreground">Loading slots…</p>
      ) : slots.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">
          No saved slots for this day yet. Save the weekly schedule first.
        </p>
      ) : (
        <div className="-mx-1 touch-pan-x overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:thin]">
          <div className="flex min-w-max snap-x gap-2">
            {slots.map((slot) => (
              <InlineSlotPill
                key={slot.id}
                slot={slot}
                drafts={drafts}
                saving={saving}
                onClick={() => onToggle(slot)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InlineSlotPill({
  slot,
  drafts,
  saving,
  onClick,
}: {
  slot: StaffSlot
  drafts: SlotDrafts
  saving: boolean
  onClick: () => void
}) {
  const displayStatus = getSlotDisplayStatus(slot, drafts)
  const draft = drafts[slot.id]
  const manageable = isSlotManageable(slot)
  const booked = slot.status === "booked" || slot.status === "held"

  let label = "Open"
  let Icon = Check
  if (booked) {
    label = slot.patientName ?? (slot.status === "held" ? "Held" : "Booked")
    Icon = Lock
  } else if (draft === "blocked") {
    label = "Will block"
    Icon = Ban
  } else if (draft === "open") {
    label = "Will reopen"
    Icon = RotateCcw
  } else if (displayStatus === "blocked") {
    label = "Blocked"
    Icon = Ban
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || !manageable}
      className={cn(
        "min-w-[5.75rem] snap-start rounded-md border px-2.5 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        booked && "cursor-not-allowed border-border bg-muted/50 text-muted-foreground",
        !booked && displayStatus === "open" && "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5",
        !booked && displayStatus === "blocked" && "border-border bg-muted text-muted-foreground hover:border-primary/40",
        draft === "blocked" && "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15",
        draft === "open" && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
      )}
      aria-label={`${formatAppointmentTime(slot.startAt)} ${label}`}
    >
      <span className="block font-semibold tabular-nums">
        {formatAppointmentTime(slot.startAt)}
      </span>
      <span className="mt-1 flex max-w-[7rem] items-center gap-1 truncate">
        <Icon className="size-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
    </button>
  )
}
