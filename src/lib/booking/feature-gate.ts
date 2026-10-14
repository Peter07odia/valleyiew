import { NextResponse } from "next/server"

import { CLINIC_CONFIG } from "@/config/clinic"

export function bookingDisabledResponse(): NextResponse | null {
  if (CLINIC_CONFIG.booking.enabled) return null

  return NextResponse.json(
    {
      error: "booking_disabled",
      message: "Online booking is handled through each clinic's Ocean page.",
    },
    {
      status: 503,
      headers: { "Retry-After": "86400" },
    }
  )
}
