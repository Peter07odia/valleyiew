import { NextResponse } from "next/server"

import { CLINIC_CONFIG } from "@/config/clinic"

export function staffAccessDisabledResponse(): NextResponse | null {
  if (CLINIC_CONFIG.staffAccess.enabled) return null

  return NextResponse.json(
    {
      error: "staff_access_disabled",
      message: "Staff access has not been configured yet.",
    },
    { status: 503 }
  )
}
