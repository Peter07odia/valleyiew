import { NextResponse } from "next/server"
import { getProvidersForLocation, getAppointmentTypes } from "@/lib/booking/queries"
import { bookingDisabledResponse } from "@/lib/booking/feature-gate"

// GET /api/booking/reference?location=<uuid>
// Visit types + providers for the chosen clinic (RLS allows reading active rows).
export async function GET(req: Request) {
  const disabled = bookingDisabledResponse()
  if (disabled) return disabled

  const url = new URL(req.url)
  const locationId = url.searchParams.get("location")
  if (!locationId) {
    return NextResponse.json({ error: "missing location" }, { status: 400 })
  }
  try {
    const [providers, types] = await Promise.all([
      getProvidersForLocation(locationId),
      getAppointmentTypes(),
    ])
    return NextResponse.json({ providers, types })
  } catch {
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }
}
