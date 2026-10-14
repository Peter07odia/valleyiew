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
  const { data, error } = await sb.rpc("hold_slot", { p_slot: parsed.data.slotId, p_minutes: 10 })
  if (error) return NextResponse.json({ error: "hold_failed" }, { status: 500 })
  if (data !== true) return NextResponse.json({ held: false }, { status: 409 }) // lost the race
  return NextResponse.json({ held: true, expiresInSeconds: 600 })
}
