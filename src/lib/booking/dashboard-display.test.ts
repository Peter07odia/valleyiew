import { describe, expect, it } from "vitest"

import {
  formatAppointmentDateTime,
  formatAppointmentTime,
  getAppointmentStatusLabel,
  groupAppointmentsByDay,
} from "./dashboard-display"

const rows = [
  {
    bookingId: "b-1",
    patientName: "Avery Singh",
    when: "2026-06-18T13:30:00.000Z",
    providerName: "Dr. A. Okafor",
    appointmentType: "Family medicine visit",
    status: "confirmed",
  },
  {
    bookingId: "b-2",
    patientName: "Mina Chen",
    when: "2026-06-19T14:00:00.000Z",
    providerName: "Dr. M. Singh",
    appointmentType: "New patient registration",
    status: "confirmed",
  },
]

describe("dashboard display helpers", () => {
  it("formats appointment times in the clinic timezone", () => {
    expect(formatAppointmentTime(rows[0].when)).toBe("9:30 AM")
    expect(formatAppointmentDateTime(rows[0].when)).toBe("Thu, Jun 18, 9:30 AM")
  })

  it("groups appointments by clinic day", () => {
    expect(groupAppointmentsByDay(rows)).toEqual([
      { label: "Thursday, Jun 18", rows: [rows[0]] },
      { label: "Friday, Jun 19", rows: [rows[1]] },
    ])
  })

  it("returns a readable label for known and unknown appointment states", () => {
    expect(getAppointmentStatusLabel("confirmed")).toBe("Confirmed")
    expect(getAppointmentStatusLabel("no_show")).toBe("No-show")
    expect(getAppointmentStatusLabel("custom_state")).toBe("Custom state")
  })
})
