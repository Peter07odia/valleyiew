import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { getStaffProfile } from "@/lib/booking/staff"
import { staffDecisionSchema } from "@/lib/booking/schemas"
import { getBookingEmailData } from "@/lib/booking/staff-queries"
import { sendBookingEmail } from "@/lib/booking/email"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

// PATCH /api/staff/requests/:id  { decision: "confirmed"|"declined", cancelReason? }
// Confirms or declines a pending request. The log_booking_event trigger writes
// the audit row and (on decline) releases the slot back to open.
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
  const parsed = staffDecisionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const sb = getServiceClient()
  const now = new Date().toISOString()

  const patch =
    parsed.data.decision === "confirmed"
      ? { status: "confirmed" as const, confirmed_at: now, confirmed_by: profile.userId }
      : {
          status: "declined" as const,
          cancelled_at: now,
          cancel_reason: parsed.data.cancelReason ?? "Declined by staff",
        }

  const { error } = await sb
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .eq("status", "pending") // only act on still-pending requests
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 })

  // Best-effort patient email for the decision (never blocks the response).
  const emailData = await getBookingEmailData(id)
  if (emailData) {
    await sendBookingEmail(parsed.data.decision === "confirmed" ? "confirmed" : "declined", emailData)
  }

  return NextResponse.json({ ok: true, decision: parsed.data.decision })
}
