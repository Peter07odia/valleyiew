import { describe, expect, it } from "vitest"

import { CLINIC_LOCATIONS } from "@/config/clinic"
import { formatCompactTime, summarizeHours } from "@/lib/constants"

describe("hours summary", () => {
  it("formats compact times", () => {
    expect(formatCompactTime("09:00")).toBe("9AM")
    expect(formatCompactTime("19:30")).toBe("7:30PM")
    expect(formatCompactTime("12:00")).toBe("12PM")
  })

  it("merges consecutive days with the same hours", () => {
    const whitby = CLINIC_LOCATIONS.find(l => l.id === "whitby")!
    expect(summarizeHours(whitby)).toEqual(["Mon–Fri 9AM–7PM", "Sat–Sun 10AM–3PM"])
    const lynden = CLINIC_LOCATIONS.find(l => l.id === "lynden-road")!
    expect(summarizeHours(lynden)).toEqual(["Mon–Fri 9AM–7PM", "Sat–Sun 9AM–2PM"])
  })
})
