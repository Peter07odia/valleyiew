import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { holdSchema } from "@/lib/booking/schemas"
import { bookingDisabledResponse } from "@/lib/booking/feature-gate"

export async function POST(req: Request) {
  const disabled = bookingDisabledResponse()
  if (disabled) return disabled

  const body = await req.json().catch(() => null)
  const parsed = holdSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const sb = getServiceClient()
  // Only release if still held (don't disturb a booked slot).
  const { error } = await sb.from("slots")
    .update({ status: "open", hold_expires_at: null })
    .eq("id", parsed.data.slotId).eq("status", "held")
  if (error) return NextResponse.json({ error: "release_failed" }, { status: 500 })
  return NextResponse.json({ released: true })
}
