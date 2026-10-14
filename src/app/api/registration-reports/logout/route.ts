import { cookies } from "next/headers";
import { reportCookie, reportResponse, validReportOrigin } from "@/lib/registration-reports/auth";
export async function POST(request: Request) {
  if (!validReportOrigin(request)) return reportResponse({ error: "Invalid origin." }, 403);
  (await cookies()).delete(reportCookie);
  return reportResponse({ success: true });
}
