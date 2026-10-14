import "server-only"
import { getServiceClient } from "@/lib/supabase/service"
import { decryptHealthCard } from "@/lib/booking/crypto"
import { getStaffProfile } from "@/lib/booking/staff"
import { CLINIC_CONFIG } from "@/config/clinic"

export interface RequestRow {
  bookingId: string
  patientName: string
  dob: string
  phone: string
  email: string | null
  healthCard: string // decrypted, staff-only
  healthCardVersion: string | null
  locationName: string
  providerName: string
  appointmentType: string
  when: string // ISO start_at
  reason: string | null
  createdAt: string
}

export interface TodayRow {
  bookingId: string
  patientName: string
  when: string
  providerName: string
  appointmentType: string
  status: string
  arrivedAt?: string | null
  reason?: string | null
}

// bytea comes back from PostgREST as a `\x...` hex string.
function hexToBuffer(v: string): Buffer {
  return Buffer.from(v.startsWith("\\x") ? v.slice(2) : v, "hex")
}

// Pending requests for the staff member's location (admins see all).
// Decrypts the health card server-side — caller must be authorized staff.
export async function getPendingRequests(): Promise<RequestRow[]> {
  const profile = await getStaffProfile()
  if (!profile) throw new Error("not_staff")

  const sb = getServiceClient()
  let q = sb
    .from("bookings")
    .select(
      `id, reason, created_at, status,
       slot:slots!bookings_slot_id_fkey(start_at),
       patient:patients(full_name, dob, phone, email, health_card_enc, health_card_version),
       provider:providers(name),
       location:locations(name),
       appointment_type:appointment_types(name)`
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  // Front desk / providers scoped to their location; admin sees all.
  if (profile.role !== "admin" && profile.locationId) {
    q = q.eq("location_id", profile.locationId)
  }

  const { data, error } = await q
  if (error) throw error

  return (data ?? []).map((b) => {
    const patient = b.patient as unknown as {
      full_name: string
      dob: string
      phone: string
      email: string | null
      health_card_enc: string | null
      health_card_version: string | null
    }
    const slot = b.slot as unknown as { start_at: string } | null
    const provider = b.provider as unknown as { name: string } | null
    const location = b.location as unknown as { name: string } | null
    const type = b.appointment_type as unknown as { name: string } | null

    let healthCard = "—"
    try {
      if (patient.health_card_enc) {
        healthCard = decryptHealthCard(hexToBuffer(patient.health_card_enc))
      }
    } catch {
      healthCard = "(decrypt error)"
    }

    return {
      bookingId: b.id,
      patientName: patient.full_name,
      dob: patient.dob,
      phone: patient.phone,
      email: patient.email,
      healthCard,
      healthCardVersion: patient.health_card_version,
      locationName: location?.name ?? "—",
      providerName: provider?.name ?? "—",
      appointmentType: type?.name ?? "—",
      when: slot?.start_at ?? "",
      reason: b.reason,
      createdAt: b.created_at,
    }
  })
}

// Confirmed bookings happening today, for the staff member's location.
export async function getTodayAppointments(): Promise<TodayRow[]> {
  const profile = await getStaffProfile()
  if (!profile) throw new Error("not_staff")

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const sb = getServiceClient()
  let q = sb
    .from("bookings")
    .select(
      `id, status, reason, arrived_at,
       slot:slots!bookings_slot_id_fkey(start_at),
       patient:patients(full_name),
       provider:providers(name),
       appointment_type:appointment_types(name)`
    )
    .in("status", ["confirmed", "arrived", "completed", "no_show"])
    .gte("slot.start_at", start.toISOString())
    .lt("slot.start_at", end.toISOString())

  if (profile.role !== "admin" && profile.locationId) {
    q = q.eq("location_id", profile.locationId)
  }

  const { data, error } = await q
  if (error) throw error

  return (data ?? [])
    .map((b) => {
      const slot = b.slot as unknown as { start_at: string } | null
      const patient = b.patient as unknown as { full_name: string } | null
      const provider = b.provider as unknown as { name: string } | null
      const type = b.appointment_type as unknown as { name: string } | null
      return {
        bookingId: b.id,
        patientName: patient?.full_name ?? "—",
        when: slot?.start_at ?? "",
        providerName: provider?.name ?? "—",
        appointmentType: type?.name ?? "—",
        status: b.status,
        arrivedAt: b.arrived_at as string | null,
        reason: b.reason as string | null,
      }
    })
    .filter((r) => r.when) // drop rows whose slot fell outside today
    .sort((a, b) => a.when.localeCompare(b.when))
}

// Confirmed appointments from now through the next `days` days (excludes today,
// which has its own tab). Returned flat + time-sorted; the UI groups by day.
export async function getUpcomingAppointments(days = 30): Promise<TodayRow[]> {
  const profile = await getStaffProfile()
  if (!profile) throw new Error("not_staff")

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + 1) // from tomorrow
  const end = new Date(start)
  end.setDate(end.getDate() + days)

  const sb = getServiceClient()
  let q = sb
    .from("bookings")
    .select(
      `id, status,
       slot:slots!bookings_slot_id_fkey(start_at),
       patient:patients(full_name),
       provider:providers(name),
       appointment_type:appointment_types(name)`
    )
    .eq("status", "confirmed")
    .gte("slot.start_at", start.toISOString())
    .lt("slot.start_at", end.toISOString())

  if (profile.role !== "admin" && profile.locationId) {
    q = q.eq("location_id", profile.locationId)
  }

  const { data, error } = await q
  if (error) throw error

  return (data ?? [])
    .map((b) => {
      const slot = b.slot as unknown as { start_at: string } | null
      const patient = b.patient as unknown as { full_name: string } | null
      const provider = b.provider as unknown as { name: string } | null
      const type = b.appointment_type as unknown as { name: string } | null
      return {
        bookingId: b.id,
        patientName: patient?.full_name ?? "—",
        when: slot?.start_at ?? "",
        providerName: provider?.name ?? "—",
        appointmentType: type?.name ?? "—",
        status: b.status,
      }
    })
    .filter((r) => r.when)
    .sort((a, b) => a.when.localeCompare(b.when))
}

export interface BookingEmailData {
  to: string
  patientName: string
  when: string | null
  endAt: string | null
  locationName: string
  locationAddress: string | null
  locationPhone: string | null
  locationMapsUrl: string | null
  providerName: string
  appointmentType: string
}

// Fetches the fields needed to email a patient about a booking. Returns null if
// the patient has no email on file (e.g. phone-only booking).
export async function getBookingEmailData(bookingId: string): Promise<BookingEmailData | null> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("bookings")
    .select(
      `id,
       slot:slots!bookings_slot_id_fkey(start_at, end_at),
       patient:patients(full_name, email),
       provider:providers(name),
       location:locations(name, address, city, province, postal_code, phone, google_maps_url),
       appointment_type:appointment_types(name)`
    )
    .eq("id", bookingId)
    .single()
  if (error || !data) return null

  const patient = data.patient as unknown as { full_name: string; email: string | null } | null
  const slot = data.slot as unknown as { start_at: string; end_at: string } | null
  const provider = data.provider as unknown as { name: string } | null
  const location = data.location as unknown as {
    name: string
    address: string | null
    city: string | null
    province: string | null
    postal_code: string | null
    phone: string | null
    google_maps_url: string | null
  } | null
  const type = data.appointment_type as unknown as { name: string } | null

  if (!patient?.email) return null

  const addressParts = location
    ? [location.address, location.city, location.province, location.postal_code].filter(Boolean)
    : []

  return {
    to: patient.email,
    patientName: patient.full_name,
    when: slot?.start_at ?? null,
    endAt: slot?.end_at ?? null,
    locationName: location?.name ?? CLINIC_CONFIG.organizationName,
    locationAddress: addressParts.length ? addressParts.join(", ") : null,
    locationPhone: location?.phone ?? null,
    locationMapsUrl: location?.google_maps_url ?? null,
    providerName: provider?.name ?? "your provider",
    appointmentType: type?.name ?? "appointment",
  }
}
