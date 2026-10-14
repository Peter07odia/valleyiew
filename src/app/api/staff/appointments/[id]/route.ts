import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { getStaffProfile } from "@/lib/booking/staff"
import { apptStateSchema } from "@/lib/booking/schemas"
import { getBookingEmailData } from "@/lib/booking/staff-queries"
import { sendBookingEmail } from "@/lib/booking/email"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

// PATCH /api/staff/appointments/:id  { state, arrivedAt? }
// Day-of state transitions:
//   confirmed -> arrived (records arrived_at) | no_show
//   arrived   -> completed | no_show
// The log_booking_event trigger audits each status change automatically.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = apptStateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const sb = getServiceClient()
  const { state, arrivedAt, cancelReason } = parsed.data

  // Staff-cancel a confirmed/arrived appointment. The log_booking_event trigger
  // releases the slot back to open and audits the change. Patient is emailed.
  if (state === "cancelled") {
    if (!cancelReason) {
      return NextResponse.json({ error: "reason_required" }, { status: 400 })
    }
    // Capture email data BEFORE cancelling (slot/booking still intact).
    const emailData = await getBookingEmailData(id)

    const { data, error } = await sb
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: cancelReason,
      })
      .eq("id", id)
      .in("status", ["confirmed", "arrived"])
      .select("id")
    if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 })
    if (!data?.length) return NextResponse.json({ error: "invalid_transition" }, { status: 409 })

    if (emailData) await sendBookingEmail("cancelled", emailData)
    return NextResponse.json({ ok: true, state: "cancelled" })
  }

  if (state === "arrived") {
    // From confirmed → arrived, stamping the arrival time (now, or staff-supplied).
    const { data, error } = await sb
      .from("bookings")
      .update({ status: "arrived", arrived_at: arrivedAt ?? new Date().toISOString() })
      .eq("id", id)
      .eq("status", "confirmed")
      .select("id")
    if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 })
    if (!data?.length) return NextResponse.json({ error: "not_confirmed" }, { status: 409 })
    return NextResponse.json({ ok: true, state: "arrived" })
  }

  // no_show / completed. Allowed from confirmed or arrived (not from terminal states).
  const { data, error } = await sb
    .from("bookings")
    .update({ status: state })
    .eq("id", id)
    .in("status", ["confirmed", "arrived"])
    .select("id")
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: "invalid_transition" }, { status: 409 })
  return NextResponse.json({ ok: true, state })
}
