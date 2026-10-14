import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { sendBookingEmail } from "@/lib/booking/email"
import { bookingDisabledResponse } from "@/lib/booking/feature-gate"
import { CLINIC_CONFIG } from "@/config/clinic"

// GET /api/cron/reminders — sends T-24h reminders for confirmed appointments
// starting in the next 24–25h window. Called by pg_cron with a bearer secret.
// Idempotent-ish: a `reminder_sent_at` flag prevents double-sends.
export async function GET(req: Request) {
  const disabled = bookingDisabledResponse()
  if (disabled) return disabled

  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const sb = getServiceClient()
  const from = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h
  const to = new Date(Date.now() + 25 * 60 * 60 * 1000) // +25h (1h window per hourly run)

  const { data, error } = await sb
    .from("bookings")
    .select(
      `id, reminder_sent_at,
       slot:slots!bookings_slot_id_fkey(start_at, end_at),
       patient:patients(full_name, email),
       provider:providers(name),
       location:locations(name, address, city, province, postal_code, phone, google_maps_url),
       appointment_type:appointment_types(name)`
    )
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("slot.start_at", from.toISOString())
    .lt("slot.start_at", to.toISOString())
  if (error) return NextResponse.json({ error: "query_failed" }, { status: 500 })

  let sent = 0
  for (const b of data ?? []) {
    const patient = b.patient as unknown as { full_name: string; email: string | null } | null
    const slot = b.slot as unknown as { start_at: string; end_at: string } | null
    const provider = b.provider as unknown as { name: string } | null
    const location = b.location as unknown as {
      name: string
      address: string | null
      city: string | null
      province: string | null
      postal_code: string | null
      phone: string | null
      google_maps_url: string | null
    } | null
    const type = b.appointment_type as unknown as { name: string } | null
    if (!patient?.email) continue

    const addressParts = location
      ? [location.address, location.city, location.province, location.postal_code].filter(Boolean)
      : []

    const ok = await sendBookingEmail("reminder", {
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
    })
    if (ok) {
      await sb.from("bookings").update({ reminder_sent_at: new Date().toISOString() }).eq("id", b.id)
      sent++
    }
  }

  return NextResponse.json({ ok: true, sent })
}
