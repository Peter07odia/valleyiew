export interface DbLocation {
  id: string
  slug: string
  name: string
  address: string
  city: string
  province: string
  postal_code: string
  phone: string
  fax: string | null
  email: string | null
  lat: number
  lng: number
  google_maps_url: string
  created_at: string
}

export interface DbLocationHours {
  id: string
  location_id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

export interface DbService {
  id: string
  slug: string
  name: string
  short_description: string
  full_description: string
  icon_name: string
  category: string
  sort_order: number
}

export interface DbWaitTime {
  id: string
  location_id: string
  estimated_minutes: number
  patients_in_queue: number
  updated_at: string
}

// Booking system types (the old `appointments` table was dropped; `bookings`
// replaces it). See supabase/migrations/0001_booking_system.sql.

export interface DbProvider {
  id: string
  location_id: string
  name: string
  specialty: string | null
  active: boolean
  created_at: string
}

export interface DbAppointmentType {
  id: string
  name: string
  default_minutes: number
  active: boolean
}

export type SlotStatus = "open" | "held" | "booked" | "blocked"

export interface DbSlot {
  id: string
  provider_id: string
  location_id: string
  appointment_type_id: string | null
  start_at: string
  end_at: string
  status: SlotStatus
  hold_expires_at: string | null
  booking_id: string | null
  created_at: string
}

export type BookingStatus =
  | "pending" | "confirmed" | "declined" | "cancelled" | "completed" | "no_show"

export interface DbBooking {
  id: string
  slot_id: string | null
  patient_id: string
  provider_id: string
  location_id: string
  appointment_type_id: string | null
  reason: string | null
  status: BookingStatus
  source: string
  notes_internal: string | null
  consent_given_at: string | null
  confirmed_at: string | null
  confirmed_by: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
}

export interface DbBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  category: string
  tags: string[]
  published_at: string
  created_at: string
}

export interface DbTestimonial {
  id: string
  patient_name: string
  location_id: string
  rating: number
  content: string
  is_featured: boolean
  is_approved: boolean
  created_at: string
}
