import "server-only";
import { createHash } from "node:crypto";
import { reportConfig } from "./auth";
import { recipientsForClinic } from "./access";
export async function sendReportEmail(subject: string, text: string, idempotencyKey?: string, recipient?: string) {
  const { emails } = reportConfig();
  if (!recipient || !emails.includes(recipient)) throw new Error("Unauthorized recipient");
  const key = process.env.VVM_EXPORT_RESEND_API_KEY;
  const sender = process.env.VVM_EXPORT_FROM_EMAIL;
  if (!key || !sender) throw new Error("Export email is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
    body: JSON.stringify({ from: `Valleyview Medical Centre <${sender}>`, to: recipient, subject, text }),
  });
  if (!response.ok) throw new Error("Email could not be sent");
  const data = await response.json();
  if (!data?.id) throw new Error("Email could not be sent");
  return data.id as string;
}
export async function notifyRegistration(id: string, location: string) {
  const recipients = recipientsForClinic(location);
  if (!recipients.length) throw new Error("No authorized recipient for clinic");
  const { origin } = reportConfig();
  const ids: string[] = [];
  for (const recipient of recipients) {
    const suffix = createHash("sha256").update(recipient).digest("hex").slice(0,20);
    ids.push(await sendReportEmail("New registration — Valleyview Medical Centre", `A new patient registration has been received.\n\nSign in to download registrations for your authorized clinics:\n${origin}/registration-reports\n\nPatient details are available only after sign-in. Downloaded files are snapshots; use the link again for the latest data.`, `valleyview-registration/${id}/${suffix}`, recipient));
  }
  return ids.join(",");
}
