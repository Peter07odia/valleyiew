import "server-only";
import { cookies } from "next/headers";
import { getRegistrationClient } from "@/lib/registration/server";
import { clinicAccess } from "./access";
import { allowedOrigin } from "@/lib/http/request";
import { getConfiguredSiteUrl } from "@/config/clinic";
export const reportCookie = "valleyview-export-session";
export function reportConfig() {
  if (process.env.VVM_REPORTS_ENABLED !== "true") throw new Error("Reports are disabled");
  const emails = [...new Set(Object.values(clinicAccess()).flat())];
  if (!emails.length) throw new Error("Clinic recipients missing");
  return { email: emails[0], emails, origin: getConfiguredSiteUrl().origin };
}
export function validReportOrigin(request: Request) { return allowedOrigin(request, true); }
export async function reportUser() {
  try {
    const { emails } = reportConfig();
    const token = (await cookies()).get(reportCookie)?.value;
    if (!token) return null;
    const { data, error } = await getRegistrationClient().auth.getUser(token);
    return !error && data.user?.email && emails.includes(data.user.email.toLowerCase()) ? data.user : null;
  } catch { return null; }
}
export async function claimAuthAttempt(kind: "send" | "verify") {
  const { data, error } = await getRegistrationClient().rpc("claim_valleyview_export_auth_attempt", { kind });
  return !error && data === true;
}
export function reportResponse(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
