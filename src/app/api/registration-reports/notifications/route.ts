import { createHash, timingSafeEqual } from "node:crypto";
import { processRegistrationNotifications } from "@/lib/registration-reports/notifications";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!secret || !timingSafeEqual(digest(request.headers.get("authorization") ?? ""), digest(`Bearer ${secret}`))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try { return Response.json(await processRegistrationNotifications(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Notification processing unavailable" }, { status: 503 }); }
}

export const GET = POST;
