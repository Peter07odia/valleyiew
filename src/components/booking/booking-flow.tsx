"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, Check, ChevronLeft, Clock, CircleDot } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookingStepper } from "./booking-stepper"
import { LocationStep } from "./location-step"
import { ServiceStep } from "./service-step"
import { TimeSlotStep } from "./time-slot-step"
import { PatientInfoStep, type PatientInfoData } from "./patient-info-step"
import { BookingSummary } from "./booking-summary"
import { HOLD_SECONDS } from "./types"
import type {
  BookingLocation,
  BookingSelection,
  DbAppointmentType,
  DbProvider,
  DbSlot,
} from "./types"

const FORM_ID = "booking-details-form"

interface BookingFlowProps {
  locations: BookingLocation[]
}

export function BookingFlow({ locations }: BookingFlowProps) {
  const [step, setStep] = useState(0)
  const [sel, setSel] = useState<BookingSelection>({
    location: null,
    appointmentType: null,
    providerId: null,
    slot: null,
  })
  const [providerName, setProviderName] = useState<string | null>(null)
  const [holdSeconds, setHoldSeconds] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<{ firstName: string } | null>(null)
  const heldSlotId = useRef<string | null>(null)

  const releaseHold = useCallback(() => {
    const id = heldSlotId.current
    if (!id) return
    heldSlotId.current = null
    // best-effort; ignore result
    fetch("/api/booking/release", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slotId: id }),
    }).catch(() => {})
  }, [])

  // Countdown timer while a slot is held (steps 2–3).
  useEffect(() => {
    if (holdSeconds == null) return
    const t = setTimeout(() => {
      if (holdSeconds <= 0) {
        toast.error("Your held time expired. Please pick another slot.")
        releaseHold()
        setSel((s) => ({ ...s, slot: null }))
        setStep(2)
        setHoldSeconds(null)
        return
      }

      setHoldSeconds((h) => (h == null ? null : h - 1))
    }, holdSeconds <= 0 ? 0 : 1000)
    return () => clearTimeout(t)
  }, [holdSeconds, releaseHold])

  // Release the hold if the user leaves the page mid-flow.
  useEffect(() => {
    const handler = () => {
      if (heldSlotId.current) {
        navigator.sendBeacon?.(
          "/api/booking/release",
          new Blob([JSON.stringify({ slotId: heldSlotId.current })], {
            type: "application/json",
          })
        )
      }
    }
    window.addEventListener("pagehide", handler)
    return () => window.removeEventListener("pagehide", handler)
  }, [])

  function pickLocation(location: BookingLocation) {
    setSel({ location, appointmentType: null, providerId: null, slot: null })
    setProviderName(null)
    setStep(1)
  }

  function onTypeSelect(appointmentType: DbAppointmentType) {
    setSel((s) => ({ ...s, appointmentType }))
  }
  function onProviderSelect(providerId: string) {
    setSel((s) => ({ ...s, providerId }))
  }

  async function onSlotSelect(slot: DbSlot) {
    // Release any prior hold before holding the new one.
    if (heldSlotId.current && heldSlotId.current !== slot.id) releaseHold()
    const res = await fetch("/api/booking/hold", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slotId: slot.id }),
    })
    if (res.status === 409) {
      toast.error("That time was just taken. Please choose another.")
      return
    }
    if (!res.ok) {
      toast.error("Could not hold that time. Try again.")
      return
    }
    heldSlotId.current = slot.id
    setSel((s) => ({ ...s, slot }))
    setHoldSeconds(HOLD_SECONDS)
  }

  function resolveProviderName(providers: DbProvider[]) {
    if (sel.providerId === "any" || !sel.providerId) return setProviderName(null)
    const p = providers.find((x) => x.id === sel.providerId)
    setProviderName(p?.name ?? null)
  }

  async function submit(data: PatientInfoData) {
    if (!sel.slot || !sel.appointmentType) return
    setSubmitting(true)
    const res = await fetch("/api/booking/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slotId: sel.slot.id,
        appointmentTypeId: sel.appointmentType.id,
        fullName: data.fullName,
        dob: data.dob,
        healthCard: data.healthCard,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        reason: data.reason || undefined,
        consent: true,
      }),
    })
    setSubmitting(false)
    if (res.status === 409) {
      toast.error("That time is no longer available. Please pick another.")
      heldSlotId.current = null
      setSel((s) => ({ ...s, slot: null }))
      setHoldSeconds(null)
      setStep(2)
      return
    }
    if (!res.ok) {
      toast.error("Something went wrong submitting your request. Please try again.")
      return
    }
    heldSlotId.current = null // slot is now booked, not held
    setHoldSeconds(null)
    setDone({ firstName: data.fullName.split(" ")[0] || "there" })
    setStep(4)
  }

  function reset() {
    releaseHold()
    setSel({ location: null, appointmentType: null, providerId: null, slot: null })
    setProviderName(null)
    setHoldSeconds(null)
    setDone(null)
    setStep(0)
  }

  return (
    <div>
      {step < 4 && (
        <div className="mb-8">
          <BookingStepper currentStep={step} />
        </div>
      )}

      {step === 0 && (
        <LocationStep
          locations={locations}
          selectedLocationId={sel.location?.id ?? null}
          onSelect={pickLocation}
        />
      )}

      {step === 1 && sel.location && (
        <div className="space-y-6">
          <BackRow onClick={() => setStep(0)} label={sel.location.name} />
          <ServiceStep
            locationId={sel.location.id}
            selectedType={sel.appointmentType}
            selectedProviderId={sel.providerId}
            onTypeSelect={onTypeSelect}
            onProviderSelect={onProviderSelect}
          />
          <Button
            disabled={!sel.appointmentType || !sel.providerId}
            onClick={() => setStep(2)}
          >
            Choose a time <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {step === 2 && sel.location && (
        <div className="space-y-6">
          <BackRow
            onClick={() => {
              releaseHold()
              setSel((s) => ({ ...s, slot: null }))
              setHoldSeconds(null)
              setStep(1)
            }}
            label={`${sel.location.name} · ${sel.appointmentType?.name ?? ""}`}
          />
          <TimeSlotStep
            locationId={sel.location.id}
            providerId={sel.providerId ?? "any"}
            selectedSlotId={sel.slot?.id ?? null}
            onSlotSelect={onSlotSelect}
          />
          {sel.slot && holdSeconds != null && (
            <div className="flex items-center justify-between rounded-xl bg-accent-warm/15 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-accent-warm">
                <Clock className="size-4" /> Holding this time for you
              </span>
              <span className="font-mono font-semibold tabular-nums text-accent-warm">
                {String(Math.floor(holdSeconds / 60)).padStart(2, "0")}:
                {String(holdSeconds % 60).padStart(2, "0")}
              </span>
            </div>
          )}
          <Button disabled={!sel.slot} onClick={() => setStep(3)}>
            Continue to your details <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {step === 3 && sel.location && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <BackRow onClick={() => setStep(2)} label="Change time" />
            <PatientInfoStep
              formId={FORM_ID}
              defaultValues={{ consent: undefined as unknown as true }}
              onSubmit={submit}
            />
            <div>
              <Button type="submit" form={FORM_ID} size="lg" disabled={submitting} className="w-full">
                <Check className="size-4" />
                {submitting ? "Submitting…" : "Request appointment"}
              </Button>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                Your request is reviewed by clinic staff before it&apos;s confirmed.
              </p>
            </div>
          </div>
          <ProviderNameLoader
            locationId={sel.location.id}
            onLoaded={resolveProviderName}
          />
          <BookingSummary
            selection={sel}
            providerName={providerName}
            holdSeconds={holdSeconds}
          />
        </div>
      )}

      {step === 4 && done && (
        <PendingScreen
          firstName={done.firstName}
          locationName={sel.location?.name ?? "our"}
          slotStart={sel.slot?.start_at ?? null}
          onReset={reset}
        />
      )}
    </div>
  )
}

function BackRow({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4" /> {label}
    </button>
  )
}

// Loads providers once on the details step so the summary can show the name.
function ProviderNameLoader({
  locationId,
  onLoaded,
}: {
  locationId: string
  onLoaded: (providers: DbProvider[]) => void
}) {
  useEffect(() => {
    let active = true
    fetch(`/api/booking/reference?location=${locationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) onLoaded(data.providers ?? [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [locationId]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function PendingScreen({
  firstName,
  locationName,
  slotStart,
  onReset,
}: {
  firstName: string
  locationName: string
  slotStart: string | null
  onReset: () => void
}) {
  const when = slotStart
    ? new Date(slotStart).toLocaleString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "your selected time"
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-accent-warm/15">
        <Clock className="size-7 text-accent-warm" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-warm/15 px-3 py-1 text-sm font-medium text-accent-warm">
        <CircleDot className="size-3" /> Pending confirmation
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">Request received</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Thanks {firstName} — your request for <b className="text-foreground">{when}</b> is
        with our {locationName} team. We&apos;ll confirm by email shortly. This time is not
        booked until you receive confirmation.
      </p>
      <Card className="mt-6 w-full max-w-md space-y-3 p-5 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          What happens next
        </p>
        <NextStep n={1} text="Staff review your details and OHIP coverage." />
        <NextStep n={2} text="You get a confirmation email with the final time." />
        <NextStep n={3} text="A reminder arrives 24 hours before your visit." />
      </Card>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        Book another appointment
      </Button>
    </div>
  )
}

function NextStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {n}
      </span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}
