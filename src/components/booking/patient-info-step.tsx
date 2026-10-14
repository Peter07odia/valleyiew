"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CLINIC_CONFIG } from "@/config/clinic"
import { cn } from "@/lib/utils"

// Form-side schema (mirrors bookingRequestSchema minus the server-only fields).
export const patientInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth is required"),
  healthCard: z
    .string()
    .trim()
    .min(5, "Please enter your health card number")
    .max(30)
    .refine(
      (v) => (v.match(/\d/g)?.length ?? 0) >= 5,
      "Enter a valid health card number"
    ),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(300).optional(),
  reason: z.string().max(1000).optional(),
  consent: z.literal(true, { message: "Consent is required" }),
})

export type PatientInfoData = z.infer<typeof patientInfoSchema>

interface PatientInfoStepProps {
  defaultValues: Partial<PatientInfoData>
  onSubmit: (data: PatientInfoData) => void
  formId: string
}

export function PatientInfoStep({
  defaultValues,
  onSubmit,
  formId,
}: PatientInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInfoData>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues,
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Your details</h2>
        <p className="text-sm text-muted-foreground">
          These details are used to review your appointment request and verify
          health coverage.
        </p>
      </div>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrap label="Full name" required error={errors.fullName?.message} htmlFor="fullName">
            <Input id="fullName" placeholder="First and last" autoComplete="name" {...register("fullName")} />
          </FieldWrap>
          <FieldWrap label="Date of birth" required error={errors.dob?.message} htmlFor="dob">
            <Input id="dob" type="date" autoComplete="bday" {...register("dob")} />
          </FieldWrap>
        </div>

        <FieldWrap
          label="Health card number"
          required
          error={errors.healthCard?.message}
          htmlFor="healthCard"
          hint="Ontario: 1234-567-890 (plus 2-letter code if on your card). Other provinces accepted. Stored encrypted."
        >
          <Input id="healthCard" placeholder="1234-567-890-AB" {...register("healthCard")} />
        </FieldWrap>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrap label="Phone" required error={errors.phone?.message} htmlFor="phone">
            <Input id="phone" type="tel" placeholder="Enter your phone number" autoComplete="tel" {...register("phone")} />
          </FieldWrap>
          <FieldWrap label="Email" error={errors.email?.message} htmlFor="email" optional>
            <Input id="email" type="email" placeholder="you@email.com" autoComplete="email" {...register("email")} />
          </FieldWrap>
        </div>

        <FieldWrap label="Address" htmlFor="address" optional>
          <Input id="address" placeholder="Street, city, postal code" autoComplete="street-address" {...register("address")} />
        </FieldWrap>

        <FieldWrap label="Reason for visit" htmlFor="reason" optional>
          <Textarea id="reason" rows={3} placeholder="Briefly describe the reason for your appointment…" {...register("reason")} />
        </FieldWrap>

        <div className="space-y-1.5">
          <label
            htmlFor="consent"
            className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 cursor-pointer"
          >
            <input
              id="consent"
              type="checkbox"
              className={cn(
                "mt-0.5 size-4 shrink-0 rounded border border-input accent-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              {...register("consent")}
            />
            <span className="text-sm text-muted-foreground">
              I consent to {CLINIC_CONFIG.organizationName} collecting this
              information to process my appointment request, in line with its
              privacy policy.
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-destructive">{errors.consent.message}</p>
          )}
        </div>
      </form>
    </div>
  )
}

function FieldWrap({
  label,
  htmlFor,
  required,
  optional,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  optional?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}{" "}
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
