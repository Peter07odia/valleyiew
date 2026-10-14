import { z } from "zod"

export const bookingSchema = z.object({
  locationId: z.string().min(1, "Please select a location"),
  serviceId: z.string().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Please select a date"),
  timeSlot: z.string().min(1, "Please select a time slot"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  healthCardNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{3}-\d{3}$/.test(val),
      "Health card format: 1234-567-890",
    ),
  reason: z.string().optional(),
  isNewPatient: z.boolean().default(true),
})

export type BookingFormData = z.infer<typeof bookingSchema>

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z
    .string()
    .min(10, "Please provide more detail")
    .max(2000, "Message is too long"),
  location: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
