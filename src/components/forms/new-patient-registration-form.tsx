"use client";

import { useRef, useState, useEffect } from "react";
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic";
import { usePreferredLocation } from "@/components/providers/preferred-location-provider";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { healthCardFormats, healthCardProvinces, parseHealthCard, type HealthCardProvince } from "@/lib/registration/health-card";

const fieldClass =
  "h-11 w-full min-w-0 rounded-none border-secondary/20 bg-white px-3.5 text-base shadow-none focus-visible:border-primary focus-visible:ring-primary/20";

const textareaClass =
  "min-h-28 rounded-none border-secondary/20 bg-white px-3.5 py-3 text-base shadow-none focus-visible:border-primary focus-visible:ring-primary/20";

const formSteps = [
  [1, "Your details"],
  [2, "Health information"],
] as const;

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor} className="justify-between">
      <span>{children}</span>
      {optional ? (
        <span className="text-xs font-normal text-muted-foreground">
          Optional
        </span>
      ) : (
        <span className="text-primary" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

export function NewPatientRegistrationForm({ preview = false }: { preview?: boolean }) {
  const { preferredLocation, hasHydrated, setPreferredLocation } = usePreferredLocation();
  const [clinicId, setClinicId] = useState("");
  const clinicTouched = useRef(false);
  const queryApplied = useRef(false);
  useEffect(() => {
    if (!hasHydrated || clinicTouched.current) return;
    if (!queryApplied.current) {
      queryApplied.current = true;
      const query = new URLSearchParams(window.location.search).get("clinic");
      const requested = CLINIC_LOCATIONS.find(l => l.slug === query || l.id === query);
      if (requested) { setClinicId(requested.id); setPreferredLocation(requested.slug); return; }
    }
    if (preferredLocation) setClinicId(preferredLocation.id);
  }, [preferredLocation, hasHydrated, setPreferredLocation]);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [healthCardProvince, setHealthCardProvince] = useState<HealthCardProvince>("ON");
  const submissionId = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateStep(currentStep: 1 | 2) {
    if (currentStep === 2 && formRef.current) {
      const numberField = formRef.current.elements.namedItem("ohipNumber") as HTMLInputElement;
      const versionField = formRef.current.elements.namedItem("ohipVersionCode") as HTMLInputElement | null;
      numberField.setCustomValidity(parseHealthCard(healthCardProvince, numberField.value, versionField?.value ?? "").error);
    }
    const panel = formRef.current?.querySelector(
      `[data-form-step="${currentStep}"]`,
    );
    const fields = panel?.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");

    for (const field of fields ?? []) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    return true;
  }

  function goToHealthStep() {
    if (!validateStep(1)) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || preview) return;
    if (!validateStep(1)) { setStep(1); return; }
    if (!validateStep(2)) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    submissionId.current ??= crypto.randomUUID();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(data),
          submissionId: submissionId.current,
          consent: data.get("consent") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "We could not save your registration. Please try again.");
        if (result.fields?.some((field: string) => ["firstName", "lastName", "email", "phone", "dateOfBirth", "gender", "address", "city", "postalCode", "preferredLocation"].includes(field))) setStep(1);
        return;
      }
      form.reset();
      setHealthCardProvince("ON");
      submissionId.current = null;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("We could not confirm your submission. Please try again; retrying will not create a duplicate.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-secondary/15 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-secondary">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-serif text-4xl text-secondary">
          Registration received
        </h2>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">
          Your registration has been saved for clinic review. Submitting this form does not confirm acceptance into the practice or book an appointment.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-7 rounded-none"
          onClick={() => {
            setSubmitted(false);
            setStep(1);
          }}
        >
          Return to form
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      className="border border-secondary/15 bg-[#FFFCF7]"
    >
      {preview && <p role="status" className="border-b bg-amber-50 px-5 py-4 text-sm text-amber-950">Design preview: please use sample details only. Registration submissions are not enabled yet.</p>}
      <div className="grid grid-cols-2 border-b border-secondary/15">
        {formSteps.map(([number, label]) => {
          const isActive = step === number;
          const isComplete = step > number;

          return (
            <div
              key={number}
              className={`flex items-center gap-3 px-5 py-4 text-sm sm:px-7 ${
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-white text-muted-foreground"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-accent-warm text-secondary"
                    : isComplete
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="size-3.5" /> : number}
              </span>
              <span className="font-semibold">{label}</span>
            </div>
          );
        })}
      </div>

      <p className="border-b border-secondary/10 bg-accent-warm/12 px-5 py-3 text-xs leading-5 text-secondary sm:px-7">
        Your information will be sent to Valleyview Medical Centre for review by your selected clinic.
      </p>

      {error && <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 sm:px-7">{error}</p>}
      <div hidden aria-hidden="true">
        <label htmlFor="website">Leave this blank</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset
        disabled={submitting}
        data-form-step="1"
        hidden={step !== 1}
        className="min-w-0 space-y-6 p-5 sm:p-7 lg:p-9"
      >
        <legend className="sr-only">Your details</legend>
        <div>
          <h2 className="font-serif text-3xl text-secondary">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell the clinic how to identify and contact you.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              name="firstName"
              maxLength={100}
              autoComplete="given-name"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              name="lastName"
              maxLength={100}
              autoComplete="family-name"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              maxLength={254}
              type="email"
              autoComplete="email"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              name="phone"
              maxLength={30}
              type="tel"
              autoComplete="tel"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              autoComplete="bday"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <select
              id="gender"
              name="gender"
              className={fieldClass}
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select
              </option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary / gender diverse</option>
              <option>Another identity</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="address">Home address</FieldLabel>
          <Input
            id="address"
            name="address"
              maxLength={250}
            autoComplete="street-address"
            className={fieldClass}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <div className="space-y-2">
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              name="city"
              maxLength={100}
              autoComplete="address-level2"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
            <Input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="preferredLocation">
            Preferred location
          </FieldLabel>
          <select
            id="preferredLocation"
            name="preferredLocation"
            className={fieldClass}
            value={clinicId}
            onChange={e => { clinicTouched.current = true; setClinicId(e.target.value); const clinic = CLINIC_LOCATIONS.find(l => l.id === e.target.value); if (clinic) setPreferredLocation(clinic.slug); }}
            required
          >
            <option value="" disabled>Select your clinic</option>
            {REGIONS.map(region => <optgroup key={region.id} label={region.name}>{CLINIC_LOCATIONS.filter(l => l.region === region.id).map(l => <option key={l.id} value={l.id}>{l.shortName} — {l.address}</option>)}</optgroup>)}
          </select>
        </div>

        <div className="flex justify-end border-t border-secondary/10 pt-6">
          <Button
            type="button"
            size="lg"
            className="h-11 rounded-none px-6"
            onClick={goToHealthStep}
          >
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </fieldset>

      <fieldset
        disabled={submitting}
        data-form-step="2"
        hidden={step !== 2}
        className="min-w-0 space-y-6 p-5 sm:p-7 lg:p-9"
      >
        <legend className="sr-only">Health information</legend>
        <div>
          <h2 className="font-serif text-3xl text-secondary">
            Health information
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide a brief overview for clinic review.
          </p>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="healthCardProvince">Health card province or territory</FieldLabel>
          <select id="healthCardProvince" name="healthCardProvince" className={fieldClass} value={healthCardProvince}
            onChange={event => {
              setHealthCardProvince(event.target.value as HealthCardProvince);
              (formRef.current?.elements.namedItem("ohipNumber") as HTMLInputElement | null)?.setCustomValidity("");
            }} required>
            {healthCardProvinces.map(code => <option key={code} value={code}>{healthCardFormats[code].name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="ohipNumber">Health card number</FieldLabel>
          <Input
            id="ohipNumber"
            name="ohipNumber"
            inputMode={["ON", "QC", "NT"].includes(healthCardProvince) ? "text" : "numeric"}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Enter the number printed on your card"
            maxLength={24}
            onInput={event => event.currentTarget.setCustomValidity("")}
            aria-describedby="health-card-help"
            className={fieldClass}
            required
          />
          <p id="health-card-help" className="text-xs leading-5 text-muted-foreground">{healthCardFormats[healthCardProvince].hint} Spaces and hyphens are accepted.</p>
        </div>
        {healthCardProvince === "ON" && <div className="space-y-2">
          <FieldLabel htmlFor="ohipVersionCode" optional>Ontario version code</FieldLabel>
          <Input id="ohipVersionCode" name="ohipVersionCode" autoComplete="off" autoCapitalize="characters" spellCheck={false}
            maxLength={2} placeholder="For example, AB" className={fieldClass} aria-describedby="version-code-help"
            onInput={() => (formRef.current?.elements.namedItem("ohipNumber") as HTMLInputElement | null)?.setCustomValidity("")} />
          <p id="version-code-help" className="text-xs leading-5 text-muted-foreground">Enter the 1 or 2 letters after your health number, if shown. Leave blank if your card has no version code or you included it above.</p>
        </div>}
        <div className="space-y-2">
          <FieldLabel htmlFor="conditions">
            Diagnosed medical conditions
          </FieldLabel>
          <Textarea
            id="conditions"
            name="conditions"
              maxLength={4000}
            placeholder="List conditions, or enter None."
            className={textareaClass}
            required
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="medications">Current medications</FieldLabel>
          <Textarea
            id="medications"
            name="medications"
              maxLength={4000}
            placeholder="List medications, or enter None."
            className={textareaClass}
            required
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="comments" optional>
            Additional comments
          </FieldLabel>
          <Textarea id="comments" name="comments" maxLength={4000} className={textareaClass} />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-secondary">
          <input type="checkbox" name="consent" required className="mt-1 size-4 shrink-0 accent-primary" />
          <span>I consent to Valleyview Medical Centre collecting and using this information to review my registration and contact me about it.</span>
        </label>

        <div className="flex items-center justify-between gap-4 border-t border-secondary/10 pt-6">
          <Button
            type="button"
            variant="ghost"
            className="rounded-none"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Button>
          <Button type="submit" disabled={preview} size="lg" className="h-11 rounded-none px-6">
            {submitting ? "Submitting…" : "Submit registration"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
