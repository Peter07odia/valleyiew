import "server-only";
import { getRegistrationClient } from "@/lib/registration/server";
import { reportConfig } from "./auth";
import { notifyRegistration } from "./email";

export async function processRegistrationNotifications() {
  reportConfig();
  const client = getRegistrationClient();
  const { data: jobs, error } = await client.rpc("claim_valleyview_registration_notifications", { batch_size: 3 });
  if (error) throw new Error("Notification queue unavailable");
  let sent = 0;
  let failed = 0;
  for (const job of jobs ?? []) {
    let providerId: string | null = null;
    try { providerId = await notifyRegistration(job.registration_id, job.preferred_location); }
    catch { failed++; }
    const result = await client.rpc("finish_valleyview_registration_notification", {
      job_id: job.registration_id, claim_token: job.lease_token, provider_id: providerId,
    });
    if (result.error || !result.data) throw new Error("Notification acknowledgment failed");
    if (providerId) sent++;
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  return { sent, failed };
}
