"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarClock,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AvailabilityEditor } from "./availability-editor"
import type { RequestRow, TodayRow } from "@/lib/booking/staff-queries"
import { cn } from "@/lib/utils"
import {
  formatAppointmentDateTime,
  formatAppointmentTime,
  getAppointmentStatusLabel,
  groupAppointmentsByDay,
} from "@/lib/booking/dashboard-display"

interface StaffDashboardProps {
  requests: RequestRow[]
  today: TodayRow[]
  upcoming: TodayRow[]
}

interface MetricProps {
  icon: LucideIcon
  label: string
  value: string | number
  detail: string
  active?: boolean
}

function Metric({ icon: Icon, label, value, detail, active }: MetricProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-4 py-3",
        active ? "border-primary/30 bg-primary/5" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function InfoLine({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{children}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-border bg-background text-foreground",
        status === "confirmed" && "border-primary/25 bg-primary/10 text-primary",
        status === "arrived" && "border-success/25 bg-success/10 text-success",
        status === "completed" && "border-secondary/20 bg-secondary/10 text-secondary",
        status === "no_show" && "border-destructive/25 bg-destructive/10 text-destructive"
      )}
    >
      {getAppointmentStatusLabel(status)}
    </Badge>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card className="items-center p-10 text-center">
      <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}

function RequestCard({
  request,
  busy,
  onDecide,
}: {
  request: RequestRow
  busy: string | null
  onDecide: (id: string, decision: "confirmed" | "declined") => void
}) {
  const disabled = busy === request.bookingId

  return (
    <Card className="p-0">
      <div className="grid gap-0 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {request.patientName}
                </h3>
                <Badge variant="outline" className="bg-accent text-accent-foreground">
                  Pending
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted {formatAppointmentDateTime(request.createdAt)}
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={disabled}
                onClick={() => onDecide(request.bookingId, "confirmed")}
              >
                <Check className="size-4" /> Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive sm:flex-none"
                disabled={disabled}
                onClick={() => onDecide(request.bookingId, "declined")}
              >
                <X className="size-4" /> Decline
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoLine icon={CalendarDays} label="Requested time">
              {formatAppointmentDateTime(request.when)}
            </InfoLine>
            <InfoLine icon={UserRound} label="Provider">
              {request.providerName}
            </InfoLine>
            <InfoLine icon={ClipboardList} label="Appointment">
              {request.appointmentType}
            </InfoLine>
            <InfoLine icon={MapPin} label="Location">
              {request.locationName}
            </InfoLine>
            <InfoLine icon={Phone} label="Phone">
              {request.phone}
            </InfoLine>
            <InfoLine icon={Mail} label="Email">
              {request.email || "Not provided"}
            </InfoLine>
          </div>

          {request.reason && (
            <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-3">
              <p className="text-xs font-medium text-muted-foreground">Reason</p>
              <p className="mt-1 text-sm text-foreground">{request.reason}</p>
            </div>
          )}
        </div>

        <aside className="border-t border-border bg-muted/30 p-4 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Health card check
          </div>
          <p className="mt-3 font-mono text-base font-semibold tabular-nums text-foreground">
            {request.healthCard}
            {request.healthCardVersion ? ` ${request.healthCardVersion}` : ""}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">DOB {request.dob}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Verify before confirming the appointment.
          </p>
        </aside>
      </div>
    </Card>
  )
}

// "Arrived" with a small popover: confirm Now, or enter a specific time.
function ArrivedButton({
  disabled,
  slotTime,
  onConfirm,
}: {
  disabled: boolean
  slotTime: string
  onConfirm: (arrivedAtIso: string) => void
}) {
  const [open, setOpen] = useState(false)
  // Default the custom field to "now" as HH:MM (clinic-local, via the input).
  const [customTime, setCustomTime] = useState("")

  function confirmNow() {
    onConfirm(new Date().toISOString())
    setOpen(false)
  }
  function confirmCustom() {
    if (!customTime) return
    // Apply the entered HH:MM to the appointment's date (today).
    const base = new Date(slotTime)
    const [h, m] = customTime.split(":").map(Number)
    base.setHours(h, m, 0, 0)
    onConfirm(base.toISOString())
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary" disabled={disabled}>
          Arrived
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Mark arrived</p>
          <p className="text-xs text-muted-foreground">When did the patient arrive?</p>
        </div>
        <Button size="sm" className="w-full" onClick={confirmNow}>
          Arrived now
        </Button>
        <div className="space-y-1.5">
          <Label htmlFor="arrived-time" className="text-xs">
            Or enter a time
          </Label>
          <div className="flex gap-2">
            <Input
              id="arrived-time"
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
            <Button size="sm" variant="outline" disabled={!customTime} onClick={confirmCustom}>
              Set
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Cancel a confirmed/arrived appointment — requires a reason. The patient is
// emailed and the slot is released back to open (handled server-side).
function CancelButton({
  disabled,
  onConfirm,
}: {
  disabled: boolean
  onConfirm: (reason: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          className="text-destructive hover:text-destructive"
        >
          Cancel
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Cancel appointment</p>
          <p className="text-xs text-muted-foreground">
            The patient is emailed and the time is freed up. Please give a reason.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cancel-reason" className="text-xs">
            Reason
          </Label>
          <Input
            id="cancel-reason"
            placeholder="e.g. Doctor unavailable"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Keep it
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-destructive text-white hover:bg-destructive/90"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason.trim())
              setOpen(false)
              setReason("")
            }}
          >
            Cancel appt
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AppointmentRow({
  appointment,
  busy,
  onSetState,
  actions = false,
}: {
  appointment: TodayRow
  busy: string | null
  onSetState?: (
    id: string,
    state: "arrived" | "no_show" | "completed" | "cancelled",
    opts?: { arrivedAt?: string; cancelReason?: string }
  ) => void
  actions?: boolean
}) {
  const isBusy = busy === appointment.bookingId
  return (
    <div className="grid gap-3 px-4 py-3 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
      <div className="font-medium tabular-nums text-primary">
        {formatAppointmentTime(appointment.when)}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground">{appointment.patientName}</p>
        <p className="text-sm text-muted-foreground">
          {appointment.appointmentType} · {appointment.providerName}
        </p>
        {appointment.reason && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Reason: {appointment.reason}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions && appointment.status === "confirmed" && onSetState ? (
          <>
            <ArrivedButton
              disabled={isBusy}
              slotTime={appointment.when}
              onConfirm={(at) => onSetState(appointment.bookingId, "arrived", { arrivedAt: at })}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => onSetState(appointment.bookingId, "no_show")}
              className="text-destructive hover:text-destructive"
            >
              No-show
            </Button>
            <CancelButton
              disabled={isBusy}
              onConfirm={(reason) => onSetState(appointment.bookingId, "cancelled", { cancelReason: reason })}
            />
          </>
        ) : actions && appointment.status === "arrived" && onSetState ? (
          <>
            <Badge
              variant="outline"
              className="border-success/25 bg-success/10 text-success"
            >
              Arrived{appointment.arrivedAt ? ` ${formatAppointmentTime(appointment.arrivedAt)}` : ""}
            </Badge>
            <Button
              size="sm"
              disabled={isBusy}
              onClick={() => onSetState(appointment.bookingId, "completed")}
            >
              Complete
            </Button>
            <CancelButton
              disabled={isBusy}
              onConfirm={(reason) => onSetState(appointment.bookingId, "cancelled", { cancelReason: reason })}
            />
          </>
        ) : (
          <StatusBadge status={appointment.status} />
        )}
      </div>
    </div>
  )
}

// Quick lookup for when a patient walks up to the desk.
function PatientSearch({
  busy,
  onSetState,
}: {
  busy: string | null
  onSetState: (
    id: string,
    state: "arrived" | "no_show" | "completed" | "cancelled",
    opts?: { arrivedAt?: string; cancelReason?: string }
  ) => void
}) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<TodayRow[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(term)}`)
        const data = await res.json()
        setResults(res.ok ? (data.results ?? []) : [])
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a patient by name or phone to check them in…"
          className="pl-9"
          aria-label="Search patients"
        />
      </div>

      {q.trim().length >= 2 && (
        <Card className="p-0">
          {searching && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No upcoming appointments match “{q.trim()}”.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {results.map((r) => (
                <AppointmentRow
                  key={r.bookingId}
                  appointment={r}
                  busy={busy}
                  onSetState={onSetState}
                  actions
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export function StaffDashboard({ requests, today, upcoming }: StaffDashboardProps) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const nextAppointment = today[0] ?? upcoming[0]

  async function decide(id: string, decision: "confirmed" | "declined") {
    setBusy(id)
    const res = await fetch(`/api/staff/requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision }),
    })
    setBusy(null)
    if (!res.ok) {
      toast.error("Could not update the request. Try again.")
      return
    }
    toast.success(decision === "confirmed" ? "Request confirmed" : "Request declined")
    router.refresh()
  }

  async function setState(
    id: string,
    state: "arrived" | "no_show" | "completed" | "cancelled",
    opts?: { arrivedAt?: string; cancelReason?: string }
  ) {
    setBusy(id)
    const body: Record<string, string> = { state }
    if (opts?.arrivedAt) body.arrivedAt = opts.arrivedAt
    if (opts?.cancelReason) body.cancelReason = opts.cancelReason
    const res = await fetch(`/api/staff/appointments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    setBusy(null)
    if (!res.ok) {
      toast.error("Could not update. Try again.")
      return
    }
    const msg =
      state === "arrived" ? "Marked arrived"
      : state === "no_show" ? "Marked no-show"
      : state === "cancelled" ? "Appointment cancelled — patient notified"
      : "Completed"
    toast.success(msg)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Booking desk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review requests, manage today&apos;s appointments, and update bookable hours.
          </p>
        </div>
        {nextAppointment && (
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <p className="text-muted-foreground">Next appointment</p>
            <p className="font-medium text-foreground">
              {formatAppointmentDateTime(nextAppointment.when)}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric
          icon={ClipboardList}
          label="Pending requests"
          value={requests.length}
          detail={requests.length === 1 ? "Needs review" : "Need review"}
          active={requests.length > 0}
        />
        <Metric
          icon={CalendarDays}
          label="Today"
          value={today.length}
          detail={today.length === 1 ? "Confirmed appointment" : "Confirmed appointments"}
        />
        <Metric
          icon={CalendarClock}
          label="Next 30 days"
          value={upcoming.length}
          detail={upcoming.length === 1 ? "Upcoming appointment" : "Upcoming appointments"}
        />
      </div>

      <PatientSearch busy={busy} onSetState={setState} />

      <Tabs defaultValue="requests" className="gap-4">
        <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl bg-muted/70 p-1 group-data-horizontal/tabs:h-auto sm:grid-cols-4">
          <TabsTrigger
            value="requests"
            className="h-auto min-h-10 justify-center px-2 py-2 text-xs sm:justify-start sm:px-3 sm:text-sm"
          >
            <ClipboardList /> Requests
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="h-auto min-h-10 justify-center px-2 py-2 text-xs sm:justify-start sm:px-3 sm:text-sm"
          >
            <CalendarDays /> Today
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="h-auto min-h-10 justify-center px-2 py-2 text-xs sm:justify-start sm:px-3 sm:text-sm"
          >
            <CalendarClock /> Upcoming
            {upcoming.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="availability"
            className="h-auto min-h-10 justify-center px-2 py-2 text-xs sm:justify-start sm:px-3 sm:text-sm"
          >
            <Settings /> Availability
          </TabsTrigger>
        </TabsList>

        {/* REQUESTS */}
        <TabsContent value="requests" className="space-y-3">
          {requests.length === 0 ? (
            <EmptyState
              icon={Check}
              title="Queue clear"
              description="New patient requests will appear here as they come in."
            />
          ) : (
            requests.map((r) => (
              <RequestCard
                key={r.bookingId}
                request={r}
                busy={busy}
                onDecide={decide}
              />
            ))
          )}
        </TabsContent>

        {/* TODAY */}
        <TabsContent value="today">
          {today.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No appointments today"
              description="Confirmed appointments for today will appear in order."
            />
          ) : (
            <Card className="divide-y divide-border p-0">
              {today.map((a) => (
                <AppointmentRow
                  key={a.bookingId}
                  appointment={a}
                  busy={busy}
                  onSetState={setState}
                  actions
                />
              ))}
            </Card>
          )}
        </TabsContent>

        {/* UPCOMING */}
        <TabsContent value="upcoming" className="space-y-5">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming appointments"
              description="Confirmed appointments in the next 30 days will be grouped by date."
            />
          ) : (
            groupAppointmentsByDay(upcoming).map((group) => (
              <div key={group.label} className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                  {group.label}
                </div>
                <Card className="divide-y divide-border p-0">
                  {group.rows.map((a) => (
                    <AppointmentRow key={a.bookingId} appointment={a} busy={busy} />
                  ))}
                </Card>
              </div>
            ))
          )}
        </TabsContent>

        {/* AVAILABILITY */}
        <TabsContent value="availability">
          <AvailabilityEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
