import { cookies } from "next/headers";
import { getRegistrationClient } from "@/lib/registration/server";
import { claimAuthAttempt, reportConfig, reportCookie, reportResponse, validReportOrigin } from "@/lib/registration-reports/auth";
export async function POST(request: Request) {
  if (!validReportOrigin(request)) return reportResponse({ error: "Invalid origin." }, 403);
  try {
    const { emails } = reportConfig();
    const input = await request.text();
    if (input.length > 500) return reportResponse({ error: "Invalid code." }, 400);
    const { code, email: inputEmail } = JSON.parse(input);
    const email = typeof inputEmail === "string" ? inputEmail.trim().toLowerCase() : "";
    if (!emails.includes(email)) return reportResponse({ error: "This email is not authorized for clinic reports." }, 403);
    if (typeof code !== "string" || !/^\d{6,10}$/.test(code)) return reportResponse({ error: "Enter the code from your email." }, 400);
    if (!await claimAuthAttempt("verify")) return reportResponse({ error: "Too many attempts. Please wait before trying again." }, 429);
    const { data, error } = await getRegistrationClient().auth.verifyOtp({ email, token: code, type: "email" });
    if (error || !data.session || data.user?.email?.toLowerCase() !== email) return reportResponse({ error: "The code is invalid or expired. Request a new one." }, 401);
    (await cookies()).set(reportCookie, data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 1800 });
    return reportResponse({ success: true });
  } catch { return reportResponse({ error: "Sign-in is temporarily unavailable." }, 503); }
}
