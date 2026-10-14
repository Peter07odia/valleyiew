import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/service"
import { getStaffProfile } from "@/lib/booking/staff"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

const CLINIC_TIME_ZONE = "America/Toronto"

// UTC instant for a given wall-clock moment in the clinic timezone.
// Computes the zone's offset for that date (DST-safe) instead of hardcoding -04:00.
function clinicMidnightUtc(date: string): Date {
  // Interpret `${date}T00:00:00` as clinic-local time.
  const asUtc = new Date(`${date}T00:00:00Z`)
  const local = new Date(asUtc.toLocaleString("en-US", { timeZone: CLINIC_TIME_ZONE }))
  const offsetMs = asUtc.getTime() - local.getTime()
  return new Date(asUtc.getTime() + offsetMs)
}

// GET /api/staff/slots?provider=<uuid>&date=YYYY-MM-DD
// Every slot for that provider on that clinic-day (open/booked/blocked/held),
// with the patient name for active bookings, so staff can manage availability.
export async function GET(req: Request) {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const providerId = url.searchParams.get("provider")
  const date = url.searchParams.get("date")
  if (!providerId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "missing params" }, { status: 400 })
  }

  const startUtc = clinicMidnightUtc(date)
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000)

  const sb = getServiceClient()
  const { data, error } = await sb
    .from("slots")
    .select(
      `id, start_at, end_at, status,
       booking:bookings!bookings_slot_id_fkey(id, status, patient:patients(full_name))`
    )
    .eq("provider_id", providerId)
    .gte("start_at", startUtc.toISOString())
    .lt("start_at", endUtc.toISOString())
    .order("start_at")
  if (error) return NextResponse.json({ error: "query_failed" }, { status: 500 })

  const slots = (data ?? []).map((s) => {
    const bookings = (s.booking ?? []) as unknown as {
      id: string
      status: string
      patient: { full_name: string } | null
    }[]
    // A slot can carry prior cancelled/declined bookings; show the active one.
    const active = bookings.find((b) => ["pending", "confirmed"].includes(b.status))
    return {
      id: s.id,
      startAt: s.start_at,
      status: s.status as "open" | "held" | "booked" | "blocked",
      patientName: active?.patient?.full_name ?? null,
    }
  })

  return NextResponse.json({ slots })
}

const patchSchema = z.object({
  action: z.enum(["block", "unblock"]),
  slotIds: z.array(z.string().uuid()).min(1).max(60),
})

// PATCH /api/staff/slots — flip open↔blocked for the given slots.
// The status guard ensures booked/held slots are never affected.
export async function PATCH(req: Request) {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const sb = getServiceClient()
  const from = parsed.data.action === "block" ? "open" : "blocked"
  const to = parsed.data.action === "block" ? "blocked" : "open"

  const { data, error } = await sb
    .from("slots")
    .update({ status: to })
    .in("id", parsed.data.slotIds)
    .eq("status", from) // only flip slots actually in the expected state
    .select("id")
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 })

  return NextResponse.json({ ok: true, changed: data?.length ?? 0 })
}
