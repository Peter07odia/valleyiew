import { allowedOrigin, trustedClientIp } from "@/lib/http/request";
import { recipientsForClinic } from "@/lib/registration-reports/access";
import { registrationSchema } from "@/lib/registration/schema";
import { getRegistrationClient, registrationRecord } from "@/lib/registration/server";

export const runtime = "nodejs";
const maxBytes = 24_000;
function reply(body: object, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "preview") return reply({ error: "Registration is not enabled on this design preview." }, 503);
  if (!allowedOrigin(request)) {
    return reply({ error: "Please submit from the clinic website." }, 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "Expected a JSON registration." }, 415);
  }
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Missing registration." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) {
        await reader.cancel();
        return reply({ error: "Registration is too long. Please shorten your answers." }, 413);
      }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return reply({ error: "Invalid registration. Please try again." }, 400);
  }
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return reply({ error: "Please check your details and complete all required fields.", fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))] }, 400);
  }
  try {
    const client = getRegistrationClient();
    if (recipientsForClinic(parsed.data.preferredLocation).length === 0) return reply({ error: "Online registration is temporarily unavailable for this clinic. Please call the clinic." }, 503);
    const trustedIp = trustedClientIp(request);
    const { error } = await client.rpc("submit_valleyview_registration", {
      registration: registrationRecord(parsed.data, trustedIp),
    });
    if (error?.code === "P0001") return reply({ error: "Too many registrations. Please try again later or contact the clinic." }, 429);
    if (error?.code === "P0002") return reply({ error: "This submission has already been received. Refresh the form to start a new registration." }, 409);
    if (error) return reply({ error: "We could not save your registration. Please try again." }, 503);
    return reply({ success: true }, 200);
  } catch {
    return reply({ error: "Registration is temporarily unavailable. Please try again later." }, 503);
  }
}
