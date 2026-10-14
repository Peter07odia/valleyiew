import "server-only";
import { registrationLocationIds } from "@/lib/registration/locations";
// User approved this existing mailbox as the interim central recipient on 2026-10-14.
// Per-clinic configuration replaces the fallback completely, so omissions never widen access.
export function clinicAccess(): Record<string, string[]> {
  const raw = process.env.VVM_REPORT_RECIPIENTS_JSON;
  const config: unknown = raw ? JSON.parse(raw) : Object.fromEntries(registrationLocationIds.map(id => [id, ["valleyviewlynden@gmail.com"]]));
  if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("Invalid clinic access configuration");
  return Object.fromEntries(registrationLocationIds.map(id => {
    const value = (config as Record<string, unknown>)[id];
    if (value === undefined) return [id, []];
    if (!Array.isArray(value) || value.some(email => typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error("Invalid clinic recipient");
    return [id, [...new Set(value.map(email => email.trim().toLowerCase()))]];
  }));
}
export function recipientsForClinic(id: string) { return clinicAccess()[id] ?? []; }
export function clinicsForEmail(email: string) { return Object.entries(clinicAccess()).filter(([, emails]) => emails.includes(email.toLowerCase())).map(([id]) => id); }
