import type { Metadata } from "next";
import { reportUser } from "@/lib/registration-reports/auth";
import { ReportPanel } from "./report-panel";
export const metadata: Metadata = { title: "Patient registration reports", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function ReportsPage() {
  return <section className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
    <p className="text-sm font-bold uppercase tracking-widest text-primary">Valleyview Medical Centre</p>
    <h1 className="mt-3 font-serif text-4xl text-secondary">Patient registration reports</h1>
    <p className="mb-8 mt-4 text-sm leading-6 text-muted-foreground">Secure access to registrations for your authorized clinics.</p>
    <ReportPanel signedIn={!!await reportUser()} />
  </section>;
}
