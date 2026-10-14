import { NextResponse } from "next/server"
import { getOpenSlots } from "@/lib/booking/queries"
import { bookingDisabledResponse } from "@/lib/booking/feature-gate"

// GET /api/booking/slots?location=<uuid>&from=<iso>&to=<iso>&provider=<uuid|any>
// Returns open slots for the picker. Reads via the anon server client (RLS
// only exposes open slots), so no service role is involved here.
export async function GET(req: Request) {
  const disabled = bookingDisabledResponse()
  if (disabled) return disabled

  const url = new URL(req.url)
  const locationId = url.searchParams.get("location")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const provider = url.searchParams.get("provider") ?? undefined
  if (!locationId || !from || !to) {
    return NextResponse.json({ error: "missing params" }, { status: 400 })
  }
  try {
    const slots = await getOpenSlots(locationId, from, to, provider)
    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }
}
