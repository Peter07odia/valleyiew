import type { TodayRow } from "@/lib/booking/staff-queries"

const CLINIC_TIME_ZONE = "America/Toronto"

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
})

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIME_ZONE,
  weekday: "long",
  month: "short",
  day: "numeric",
})

export function formatAppointmentDateTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return dateTimeFormatter.format(new Date(iso))
}

export function formatAppointmentTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return timeFormatter.format(new Date(iso))
}

export function groupAppointmentsByDay<T extends Pick<TodayRow, "when">>(
  rows: T[]
): { label: string; rows: T[] }[] {
  const buckets = new Map<string, T[]>()

  for (const row of rows) {
    const label = row.when ? dayFormatter.format(new Date(row.when)) : "Unscheduled"
    buckets.set(label, [...(buckets.get(label) ?? []), row])
  }

  return Array.from(buckets, ([label, rows]) => ({ label, rows }))
}

export function getAppointmentStatusLabel(status: string) {
  if (status === "no_show") return "No-show"
  const label = status.replaceAll("_", " ")
  return label[0]?.toUpperCase() + label.slice(1)
}
