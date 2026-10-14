import type { Metadata } from "next";

import { NewPatientRegistrationForm } from "@/components/forms/new-patient-registration-form";

export const metadata: Metadata = {
  title: "New Patient Registration",
  description:
    "Submit a new-patient registration to Valleyview Medical Centre.",
  robots: { index: false, follow: false },
};

export default function NewPatientFormPage() {
  return (
    <section className="min-h-[70vh] bg-background px-5 py-12 sm:px-10 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Valleyview Medical Centre · Seven Ontario clinics
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.035em] text-secondary sm:text-5xl">
            Patient registration
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            A short two-step form for patients interested in joining a
            Valleyview family practice.
          </p>
        </div>

        <NewPatientRegistrationForm preview={!process.env.VVM_REGISTRATION_SERVICE_ROLE_KEY || process.env.VERCEL_ENV === "preview"} />
      </div>
    </section>
  );
}
