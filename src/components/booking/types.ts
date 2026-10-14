import type { DbProvider, DbAppointmentType, DbSlot } from "@/lib/supabase/types"

// Minimal location shape the flow needs (from getActiveLocations()).
export interface BookingLocation {
  id: string
  slug: string
  name: string
  address: string
  city: string
  province: string
  phone: string | null
}

export interface BookingSelection {
  location: BookingLocation | null
  appointmentType: DbAppointmentType | null
  providerId: string | null // a provider uuid, or "any"
  slot: DbSlot | null
}

export type { DbProvider, DbAppointmentType, DbSlot }

export const HOLD_SECONDS = 600 // 10 minutes, matches hold_slot() default
