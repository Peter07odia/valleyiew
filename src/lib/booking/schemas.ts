import { z } from "zod"

// Ontario (OHIP) card: 10 digits grouped 4-3-3, optional 2-letter version code
// (e.g. 1234-567-890 or 1234-567-890-AB). Legacy red/white cards have no code.
export const OHIP_PATTERN = /^(\d{4})-?(\d{3})-?(\d{3})(?:-?([A-Za-z]{2}))?$/

// We accept ANY province's health number (out-of-province patients allowed;
// staff verify manually). Just require a few digits so it isn't empty/garbage.
export const bookingRequestSchema = z.object({
  slotId: z.string().uuid(),
  appointmentTypeId: z.string().uuid(),
  fullName: z.string().min(1).max(120),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD"),
  healthCard: z
    .string()
    .trim()
    .min(5, "Please enter your health card number")
    .max(30)
    .refine((v) => (v.match(/\d/g)?.length ?? 0) >= 5, "Enter a valid health card number"),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(300).optional(),
  reason: z.string().max(1000).optional(),
  consent: z.literal(true, { message: "Consent is required" }),
})
export type BookingRequest = z.infer<typeof bookingRequestSchema>

// Splits an OHIP-formatted card into the 10-digit number (normalized 4-3-3)
// and the optional version code. For non-OHIP inputs, returns the raw string
// with no version code (stored encrypted as-is; staff verify).
export function splitHealthCard(raw: string): { number: string; version: string | null } {
  const m = raw.trim().match(OHIP_PATTERN)
  if (!m) return { number: raw.trim(), version: null }
  const number = `${m[1]}-${m[2]}-${m[3]}`
  const version = m[4] ? m[4].toUpperCase() : null
  return { number, version }
}

export const holdSchema = z.object({ slotId: z.string().uuid() })

export const staffDecisionSchema = z.object({
  decision: z.enum(["confirmed", "declined"]),
  cancelReason: z.string().max(500).optional(),
})

export const apptStateSchema = z.object({
  state: z.enum(["arrived", "no_show", "completed", "cancelled"]),
  // Optional arrival time when marking arrived; defaults to now if omitted.
  arrivedAt: z.string().datetime().optional(),
  // Required when cancelling a confirmed/arrived appointment.
  cancelReason: z.string().trim().min(1).max(500).optional(),
})
