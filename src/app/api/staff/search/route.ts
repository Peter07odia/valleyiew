import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { getStaffProfile } from "@/lib/booking/staff"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

// GET /api/staff/search?q=<name or phone>
// Finds active appointments (confirmed/arrived) from today onward by patient
// name or phone, so the front desk can quickly check someone in.
export async function GET(req: Request) {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim()
  if (q.length < 2) return NextResponse.json({ results: [] })

  const sb = getServiceClient()
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  // Match patients by name or phone first, then pull their upcoming appointments.
  const like = `%${q}%`
  const { data: patients } = await sb
    .from("patients")
    .select("id")
    .or(`full_name.ilike.${like},phone.ilike.${like}`)
    .limit(25)
  const patientIds = (patients ?? []).map((p) => p.id)
  if (patientIds.length === 0) return NextResponse.json({ results: [] })

  let query = sb
    .from("bookings")
    .select(
      `id, status, reason, arrived_at,
       slot:slots!bookings_slot_id_fkey(start_at),
       patient:patients(full_name, phone),
       provider:providers(name),
       appointment_type:appointment_types(name)`
    )
    .in("patient_id", patientIds)
    .in("status", ["confirmed", "arrived"])
    .gte("slot.start_at", start.toISOString())

  if (profile.role !== "admin" && profile.locationId) {
    query = query.eq("location_id", profile.locationId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: "search_failed" }, { status: 500 })

  const results = (data ?? [])
    .map((b) => {
      const slot = b.slot as unknown as { start_at: string } | null
      const patient = b.patient as unknown as { full_name: string; phone: string } | null
      const provider = b.provider as unknown as { name: string } | null
      const type = b.appointment_type as unknown as { name: string } | null
      return {
        bookingId: b.id,
        patientName: patient?.full_name ?? "—",
        phone: patient?.phone ?? "",
        when: slot?.start_at ?? "",
        providerName: provider?.name ?? "—",
        appointmentType: type?.name ?? "—",
        status: b.status,
        arrivedAt: b.arrived_at as string | null,
        reason: b.reason as string | null,
      }
    })
    .filter((r) => r.when)
    .sort((a, b) => a.when.localeCompare(b.when))

  return NextResponse.json({ results })
}
