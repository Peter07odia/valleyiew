import { describe, it, expect } from "vitest"
import { bookingRequestSchema, splitHealthCard } from "./schemas"

const valid = {
  slotId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  appointmentTypeId: "f6e5d4c3-b2a1-4f8e-9d0c-1b2a3c4d5e6f",
  fullName: "Jane Doe",
  dob: "1990-01-01",
  healthCard: "1234-567-890",
  phone: "705-555-0100",
  email: "jane@example.com",
  reason: "Checkup",
  consent: true,
}

describe("bookingRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(bookingRequestSchema.safeParse(valid).success).toBe(true)
  })
  it("rejects without consent", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, consent: false }).success).toBe(false)
  })
  it("accepts an OHIP card with a version code", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, healthCard: "1234-567-890-AB" }).success).toBe(true)
  })
  it("accepts an out-of-province health number", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, healthCard: "H 1234 56789" }).success).toBe(true)
  })
  it("rejects a too-short / non-numeric health card", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, healthCard: "abc" }).success).toBe(false)
  })
})

describe("splitHealthCard", () => {
  it("splits OHIP number + version code", () => {
    expect(splitHealthCard("1234-567-890-AB")).toEqual({ number: "1234-567-890", version: "AB" })
  })
  it("handles OHIP number with no version code", () => {
    expect(splitHealthCard("1234-567-890")).toEqual({ number: "1234-567-890", version: null })
  })
  it("normalizes an unhyphenated OHIP number", () => {
    expect(splitHealthCard("1234567890ab")).toEqual({ number: "1234-567-890", version: "AB" })
  })
  it("passes non-OHIP input through with no version", () => {
    expect(splitHealthCard("H 1234 56789")).toEqual({ number: "H 1234 56789", version: null })
  })
})
