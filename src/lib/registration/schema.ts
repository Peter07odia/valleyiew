import { registrationLocationIds } from "./locations";
import { z } from "zod";
import { healthCardProvinces, parseHealthCard } from "./health-card";

const text = (max: number) => z.string().trim().min(1).max(max);
export const registrationSchema = z.object({
  submissionId: z.uuid(),
  firstName: text(100),
  lastName: text(100),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().max(30).transform((value) => value.replace(/\D/g, ""))
    .refine((value) => /^(1)?[2-9]\d{9}$/.test(value), "Enter a valid phone number."),
  dateOfBirth: z.iso.date().refine((value) => value >= "1900-01-01" && value <= new Date().toISOString().slice(0, 10), "Enter a valid date of birth."),
  gender: z.enum(["Female", "Male", "Non-binary / gender diverse", "Another identity", "Prefer not to say"]),
  address: text(250),
  city: text(100),
  postalCode: z.string().trim().toUpperCase().transform((value) => value.replace(/\s/g, ""))
    .refine((value) => /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ]\d[ABCEGHJ-NPRSTVWXYZ]\d$/.test(value), "Enter a valid Canadian postal code."),
  preferredLocation: z.enum(registrationLocationIds),
  healthCardProvince: z.enum(healthCardProvinces).default("ON"),
  ohipNumber: z.string().min(1).max(24),
  ohipVersionCode: z.string().max(4).default(""),
  conditions: text(4000),
  medications: text(4000),
  comments: z.string().trim().max(4000).default(""),
  consent: z.literal(true),
  website: z.literal("").default(""),
}).superRefine((data, ctx) => {
  const card = parseHealthCard(data.healthCardProvince, data.ohipNumber, data.ohipVersionCode);
  if (card.error) ctx.addIssue({ code: "custom", path: ["ohipNumber"], message: card.error });
}).transform(data => {
  const card = parseHealthCard(data.healthCardProvince, data.ohipNumber, data.ohipVersionCode);
  return { ...data, ohipNumber: card.number, ohipVersionCode: card.versionCode };
});
export type Registration = z.infer<typeof registrationSchema>;
