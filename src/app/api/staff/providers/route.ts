import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { getStaffProfile } from "@/lib/booking/staff"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

// Providers the staff member may manage. Admin sees all; others see their
// location's providers. Also returns appointment types for template defaults.
export async function GET() {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const sb = getServiceClient()
  let pq = sb.from("providers").select("id, name, location_id").eq("active", true).order("name")
  if (profile.role !== "admin" && profile.locationId) {
    pq = pq.eq("location_id", profile.locationId)
  }
  const [{ data: providers }, { data: types }] = await Promise.all([
    pq,
    sb.from("appointment_types").select("id, name, default_minutes").eq("active", true).order("default_minutes"),
  ])
  return NextResponse.json({ providers: providers ?? [], types: types ?? [] })
}
