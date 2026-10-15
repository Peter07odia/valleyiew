import { z } from "zod"
import { CLINIC_LOCATIONS } from "@/config/clinic"

const optionalName = z.string().trim().max(100).default("")

export const contactSchema = z.object({
  submissionId: z.uuid(),
  clinic: z.string().refine(slug => CLINIC_LOCATIONS.some(location => location.slug === slug), "Choose your clinic."),
  firstName: optionalName,
  lastName: optionalName,
  email: z.email("Enter a valid email address.").max(254).transform(value => value.toLowerCase()),
  phone: z
    .string()
    .max(30)
    .transform(value => value.replace(/\D/g, ""))
    .refine(value => /^(1)?[2-9]\d{9}$/.test(value), "Enter a valid phone number."),
  message: z.string().trim().min(1, "Enter a message.").max(2000, "Please keep your message under 2,000 characters."),
  // Honeypot: real visitors never see or fill this field.
  website: z.literal("").default(""),
})

export type ContactMessage = z.infer<typeof contactSchema>
