import { getRegistrationClient } from "@/lib/registration/server";
import { claimAuthAttempt, reportConfig, reportResponse, validReportOrigin } from "@/lib/registration-reports/auth";
import { sendReportEmail } from "@/lib/registration-reports/email";
export async function POST(request: Request) {
  if (!validReportOrigin(request)) return reportResponse({ error: "Open the report page to sign in." }, 403);
  try {
    const { emails, origin } = reportConfig();
    const input = await request.text();
    if (input.length > 500) return reportResponse({ error: "Invalid request." }, 400);
    const body = JSON.parse(input);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!emails.includes(email)) return reportResponse({ error: "This email is not authorized for clinic reports." }, 403);
    if (!await claimAuthAttempt("send")) return reportResponse({ error: "Please wait before requesting another code." }, 429);
    const { data, error } = await getRegistrationClient().auth.admin.generateLink({ type: "magiclink", email });
    if (error || !data.properties?.email_otp) throw new Error("Could not generate code");
    await sendReportEmail("Your sign-in code — Valleyview registration reports", `Your one-time sign-in code is:\n\n${data.properties.email_otp}\n\nEnter it at ${origin}/registration-reports\n\nThis provides access to confidential clinic registration reports. Keep the code private. If you did not request this code, ignore this email.`, undefined, email);
    return reportResponse({ success: true });
  } catch { return reportResponse({ error: "We could not send the sign-in code. Please try again later." }, 503); }
}
