"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import { cn } from "@/lib/utils"

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string }

const inputClass =
  "h-11 w-full border border-secondary/20 bg-white px-3 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive"

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-secondary">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">Please check this field.</p> : null}
    </div>
  )
}

export function ContactMessageForm({ preview = false }: { preview?: boolean }) {
  const { preferredLocation, hasHydrated } = usePreferredLocation()
  const [clinic, setClinic] = useState("")
  // One id per message so a retried request is never emailed twice.
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID())
  const [status, setStatus] = useState<Status>({ state: "idle" })
  const [invalid, setInvalid] = useState<string[]>([])

  // Default to the visitor's clinic, without overriding a choice made here.
  const selected = clinic || (hasHydrated ? preferredLocation?.slug ?? "" : "")
  const selectedClinic = CLINIC_LOCATIONS.find(l => l.slug === selected)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (preview || status.state === "sending") return
    const form = new FormData(event.currentTarget)
    setStatus({ state: "sending" })
    setInvalid([])
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form), clinic: selected, submissionId }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.ok) {
        setStatus({ state: "sent" })
        return
      }
      setInvalid(Array.isArray(result.fields) ? result.fields : [])
      setStatus({ state: "error", message: result.error ?? "Your message could not be sent. Please call your clinic." })
    } catch {
      setStatus({ state: "error", message: "Your message could not be sent. Please call your clinic." })
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h3 className="font-serif text-2xl text-secondary">Message sent</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Thank you. {selectedClinic?.shortName ?? "Your clinic"} will reply by email or phone. For anything urgent, please call the clinic.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmissionId(crypto.randomUUID())
            setStatus({ state: "idle" })
          }}
          className="text-sm font-semibold text-primary underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    )
  }

  const isInvalid = (name: string) => invalid.includes(name)

  return (
    <form onSubmit={submit} noValidate={false} aria-label="Send us a message" className="space-y-5">
      {preview ? (
        <p role="status" className="border-l-4 border-accent-warm bg-accent-warm/15 px-4 py-3 text-sm text-secondary">
          Online messages are not switched on yet. Please call your clinic in the meantime.
        </p>
      ) : null}
      <Field id="contact-clinic" label="Clinic" required error={isInvalid("clinic")}>
        <select
          id="contact-clinic"
          name="clinic"
          required
          value={selected}
          aria-invalid={isInvalid("clinic") || undefined}
          onChange={event => setClinic(event.target.value)}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="" disabled>
            Choose your clinic
          </option>
          {REGIONS.map(region => (
            <optgroup key={region.id} label={region.name}>
              {CLINIC_LOCATIONS.filter(l => l.region === region.id).map(l => (
                <option key={l.slug} value={l.slug}>
                  {l.shortName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-first" label="First name" error={isInvalid("firstName")}>
          <input id="contact-first" name="firstName" autoComplete="given-name" maxLength={100} className={inputClass} aria-invalid={isInvalid("firstName") || undefined} />
        </Field>
        <Field id="contact-last" label="Last name" error={isInvalid("lastName")}>
          <input id="contact-last" name="lastName" autoComplete="family-name" maxLength={100} className={inputClass} aria-invalid={isInvalid("lastName") || undefined} />
        </Field>
        <Field id="contact-email" label="Email address" required error={isInvalid("email")}>
          <input id="contact-email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputClass} aria-invalid={isInvalid("email") || undefined} />
        </Field>
        <Field id="contact-phone" label="Phone number" required error={isInvalid("phone")}>
          <input id="contact-phone" name="phone" type="tel" required autoComplete="tel" maxLength={30} placeholder="123-456-7890" className={inputClass} aria-invalid={isInvalid("phone") || undefined} />
        </Field>
      </div>
      <Field id="contact-message" label="Message" required error={isInvalid("message")}>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          maxLength={2000}
          className={cn(inputClass, "h-auto min-h-28 py-2.5")}
          aria-invalid={isInvalid("message") || undefined}
          aria-describedby="contact-privacy"
        />
      </Field>
      {/* Honeypot for bots; hidden from people and assistive technology. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" defaultValue="" />
      <p id="contact-privacy" className="text-xs leading-5 text-muted-foreground">
        Please don&apos;t include health card numbers or medical details. This form is for general questions, not urgent care. For emergencies, call 911.
      </p>
      {status.state === "error" ? (
        <p role="alert" className="border-l-4 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {status.message}
          {selectedClinic?.phone ? (
            <>
              {" "}
              <a href={`tel:${selectedClinic.phone.replace(/\D/g, "")}`} className="font-semibold underline">
                {selectedClinic.phone}
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={preview || status.state === "sending"}
        className="flex h-12 w-full items-center justify-center gap-2 bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status.state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
        {status.state === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  )
}
