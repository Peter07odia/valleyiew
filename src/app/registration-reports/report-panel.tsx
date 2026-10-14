"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReportPanel({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (sent) codeRef.current?.focus(); }, [sent]);
  useEffect(() => {
    if (!resendAfter) return;
    const timer = setTimeout(() => setResendAfter(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendAfter]);

  async function action(path: string, data: object) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/registration-reports/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Please try again."); return; }
      if (path === "login") { setSent(true); setCode(""); setResendAfter(60); }
      else { setCode(""); setSent(false); router.refresh(); }
    } catch { setError("Could not connect. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="border border-secondary/15 bg-white p-6 sm:p-9" aria-busy={busy}>
    {error && <p role="alert" className="mb-5 border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {signedIn ? <div className="space-y-6">
      <div><h2 className="font-serif text-2xl text-secondary">Your registration workbook</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Download registrations for your authorized clinics, including health card numbers, with a separate sheet for each clinic. Each download includes the latest saved records.</p></div>
      <Button asChild className="h-auto min-h-11 w-full whitespace-normal py-3"><a href="/api/registration-reports/download"><Download className="size-4 shrink-0" />Download registrations (.xlsx)</a></Button>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <span className="text-xs text-muted-foreground">Access expires after 30 minutes.</span>
        <Button variant="outline" disabled={busy} onClick={() => action("logout", {})}>Sign out</Button>
      </div>
    </div> : !sent ? <form className="space-y-5" onSubmit={event => { event.preventDefault(); action("login", { email }); }}>
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Step 1 of 2</p>
        <h2 className="mt-2 font-serif text-2xl text-secondary">Sign in to clinic reports</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your authorized clinic email to receive a sign-in code.</p></div>
      <div className="space-y-2"><label className="block text-sm font-semibold" htmlFor="report-email">Email address</label>
        <Input id="report-email" type="email" required maxLength={254} autoComplete="email" disabled={busy} value={email} onChange={event => setEmail(event.target.value)} className="h-12" /></div>
      <Button disabled={busy} className="min-h-11 w-full" type="submit">{busy ? "Sending code…" : "Continue"}<ArrowRight className="size-4" /></Button>
    </form> : <form className="space-y-5" onSubmit={event => { event.preventDefault(); action("verify", { code, email }); }}>
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Step 2 of 2</p>
        <h2 className="mt-2 font-serif text-2xl text-secondary">Check your email</h2>
        <p role="status" className="mt-2 break-words text-sm leading-6 text-muted-foreground"><Mail className="mr-2 inline size-4" />We sent a code to <span className="font-semibold text-secondary">{email}</span>.</p></div>
      <div className="space-y-2"><label className="block text-sm font-semibold" htmlFor="report-code">Sign-in code</label>
        <Input ref={codeRef} id="report-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} required disabled={busy} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} className="h-12 text-xl tracking-[0.25em]" /></div>
      <Button disabled={busy} className="min-h-11 w-full" type="submit">{busy ? "Signing in…" : "Sign in"}</Button>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button type="button" variant="ghost" disabled={busy} onClick={() => { setSent(false); setCode(""); setError(""); }}><ArrowLeft className="size-4" />Change email</Button>
        <Button type="button" variant="ghost" disabled={busy || resendAfter > 0} onClick={() => action("login", { email })}>{resendAfter ? `Resend in ${resendAfter}s` : "Resend code"}</Button>
      </div>
    </form>}
  </div>;
}
