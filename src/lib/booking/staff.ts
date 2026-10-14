import { getSupabaseServerClient } from "@/lib/supabase/server"

export type StaffRole = "admin" | "front_desk" | "provider"

export interface StaffProfile {
  userId: string
  role: StaffRole
  fullName: string | null
  locationId: string | null
}

// Returns the signed-in staff member's profile, or null if not staff.
// Uses getClaims() to validate the JWT, then reads the role from profiles.
export async function getStaffProfile(): Promise<StaffProfile | null> {
  const sb = await getSupabaseServerClient()
  const { data: claims } = await sb.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return null

  const { data, error } = await sb
    .from("profiles")
    .select("user_id, role, full_name, location_id, active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle()
  if (error || !data) return null

  return {
    userId: data.user_id,
    role: data.role as StaffRole,
    fullName: data.full_name,
    locationId: data.location_id,
  }
}
