import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { DbProvider, DbAppointmentType, DbSlot } from "@/lib/supabase/types"

export async function getActiveLocations() {
  const sb = await getSupabaseServerClient()
  const { data, error } = await sb.from("locations")
    .select("id, slug, name, address, city, province, phone")
    .eq("active", true).order("name")
  if (error) throw error
  return data ?? []
}

export async function getProvidersForLocation(locationId: string): Promise<DbProvider[]> {
  const sb = await getSupabaseServerClient()
  const { data, error } = await sb.from("providers")
    .select("*").eq("location_id", locationId).eq("active", true).order("name")
  if (error) throw error
  return (data ?? []) as DbProvider[]
}

export async function getAppointmentTypes(): Promise<DbAppointmentType[]> {
  const sb = await getSupabaseServerClient()
  const { data, error } = await sb.from("appointment_types")
    .select("*").eq("active", true).order("default_minutes")
  if (error) throw error
  return (data ?? []) as DbAppointmentType[]
}

// Open slots for a location within [from, to). Optionally filter by provider.
// When no provider is chosen ("first available"), collapse slots that share the
// same start time so the patient sees each time ONCE — the booking later picks
// whichever doctor is free at that instant (auto-assignment).
export async function getOpenSlots(
  locationId: string, from: string, to: string, providerId?: string,
): Promise<DbSlot[]> {
  const sb = await getSupabaseServerClient()
  let q = sb.from("slots").select("*")
    .eq("location_id", locationId).eq("status", "open")
    .gte("start_at", from).lt("start_at", to).order("start_at")
  if (providerId && providerId !== "any") q = q.eq("provider_id", providerId)
  const { data, error } = await q
  if (error) throw error
  const slots = (data ?? []) as DbSlot[]

  if (providerId && providerId !== "any") return slots

  // "First available": one slot per start time (keep the first provider's).
  const seen = new Set<string>()
  return slots.filter((s) => {
    if (seen.has(s.start_at)) return false
    seen.add(s.start_at)
    return true
  })
}
