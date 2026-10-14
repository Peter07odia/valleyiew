import { describe, expect, it } from "vitest"

import { bookingDisabledResponse } from "@/lib/booking/feature-gate"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

describe("Phase 1 feature gates", () => {
  it("blocks public booking APIs", async () => {
    const response = bookingDisabledResponse()

    expect(response?.status).toBe(503)
    await expect(response?.json()).resolves.toMatchObject({
      error: "booking_disabled",
    })
  })

  it("blocks staff APIs until staff access is configured", async () => {
    const response = staffAccessDisabledResponse()

    expect(response?.status).toBe(503)
    await expect(response?.json()).resolves.toMatchObject({
      error: "staff_access_disabled",
    })
  })
})
