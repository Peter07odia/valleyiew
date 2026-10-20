import "server-only";
import { formInboxFor } from "@/lib/contact/recipients";
import { registrationLocationIds } from "@/lib/registration/locations";
// Each clinic's form inbox by default. VVM_REPORT_RECIPIENTS_JSON replaces the defaults
// completely, so omissions never widen access.
export function clinicAccess(): Record<string, string[]> {
  const raw = process.env.VVM_REPORT_RECIPIENTS_JSON;
  const config: unknown = raw ? JSON.parse(raw) : Object.fromEntries(registrationLocationIds.map(id => [id, [formInboxFor(id)!]]));
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
