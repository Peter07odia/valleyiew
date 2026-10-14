import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { bookingRequestSchema, splitHealthCard } from "@/lib/booking/schemas"
import { encryptHealthCard } from "@/lib/booking/crypto"
import { getBookingEmailData } from "@/lib/booking/staff-queries"
import { sendBookingEmail } from "@/lib/booking/email"
import { bookingDisabledResponse } from "@/lib/booking/feature-gate"

export async function POST(req: Request) {
  const disabled = bookingDisabledResponse()
  if (disabled) return disabled

  const body = await req.json().catch(() => null)
  const parsed = bookingRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 400 })
  }
  const r = parsed.data
  const sb = getServiceClient()

  // Split OHIP version code (if present) from the 10-digit number; non-OHIP
  // inputs pass through unchanged (out-of-province patients allowed).
  const { number: hcNumber, version: hcVersion } = splitHealthCard(r.healthCard)

  // 1. patient (insert; health card number encrypted app-side, stored as bytea)
  const { data: patient, error: pErr } = await sb.from("patients").insert({
    full_name: r.fullName,
    dob: r.dob,
    phone: r.phone,
    email: r.email || null,
    address: r.address || null,
    // bytea over PostgREST: hex string with the `\x` prefix Postgres decodes.
    health_card_enc: "\\x" + encryptHealthCard(hcNumber).toString("hex"),
    health_card_version: hcVersion,
  }).select("id").single()
  if (pErr || !patient) return NextResponse.json({ error: "patient_failed" }, { status: 500 })

  // 2. booking on the held slot (atomic; flips slot -> booked, booking -> pending)
  const { data: bookingId, error: bErr } = await sb.rpc("create_booking", {
    p_slot: r.slotId,
    p_patient: patient.id,
    p_type: r.appointmentTypeId,
    p_reason: r.reason || null,
    p_consent: new Date().toISOString(),
  })
  if (bErr) {
    const msg = bErr.message.includes("slot_unavailable") ? "slot_unavailable" : "booking_failed"
    return NextResponse.json({ error: msg }, { status: 409 })
  }

  // Best-effort "request received" email (never blocks the booking).
  const emailData = await getBookingEmailData(bookingId as string)
  if (emailData) await sendBookingEmail("requested", emailData)

  return NextResponse.json({ bookingId, status: "pending" }, { status: 201 })
}
