import { createHmac } from "node:crypto"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { contactSchema } from "@/lib/contact/schema"
import { sendContactMessage } from "@/lib/contact/send"
import { allowedOrigin, readBoundedJson, trustedClientIp } from "@/lib/http/request"
import { getRegistrationClient } from "@/lib/registration/server"

export const runtime = "nodejs"
const reply = (body: object, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
const unavailable = "Your message could not be sent right now. Please call your clinic."

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "preview") return reply({ error: "Messages are not enabled on this design preview." }, 503)
  if (!allowedOrigin(request, true)) return reply({ error: "Please send your message from the clinic website." }, 403)
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Invalid message." }, 415)
  let input: unknown
  try {
    input = await readBoundedJson(request, 8_000)
  } catch {
    return reply({ error: "Your message is too long. Please shorten it." }, 413)
  }
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return reply({ error: "Please check the highlighted fields.", fields: [...new Set(parsed.error.issues.map(issue => String(issue.path[0])))] }, 400)
  }
  const location = CLINIC_LOCATIONS.find(l => l.slug === parsed.data.clinic)!
  try {
    // Persistent per-sender limit, kept separate from the chat allowance.
    const key = process.env.VVM_CHAT_RATE_LIMIT_SECRET
    if (!key) return reply({ error: unavailable }, 503)
    const fingerprint = createHmac("sha256", key).update(`contact:${trustedClientIp(request)}`).digest("hex")
    const { data, error } = await getRegistrationClient().rpc("claim_valleyview_chat_request", { client_fingerprint: fingerprint })
    if (error) return reply({ error: unavailable }, 503)
    if (!data) return reply({ error: "Too many messages. Please call your clinic or try again later." }, 429)
    await sendContactMessage(parsed.data, location)
    return reply({ success: true }, 200)
  } catch {
    return reply({ error: unavailable }, 503)
  }
}
