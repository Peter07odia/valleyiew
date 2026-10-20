import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { contactSchema } from "./schema"
import { contactRecipientFor } from "./recipients"

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock("@/lib/registration/server", () => ({ getRegistrationClient: () => ({ rpc }) }))
import { POST } from "@/app/api/contact/route"

const message = {
  submissionId: "4f7c2a52-8a43-4c1e-9d55-2a3b5c6d7e8f",
  clinic: "oshawa",
  firstName: "Synthetic",
  lastName: "Visitor",
  email: "Visitor@Example.com",
  phone: "(416) 555-0100",
  message: "What time do you open on Friday?",
}
const request = (body: unknown = message, origin = "http://localhost:3200", raw?: string) =>
  new Request("http://localhost:3200/api/contact", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  })
const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test")
  vi.stubEnv("VERCEL_ENV", "")
  vi.stubEnv("VVM_CHAT_RATE_LIMIT_SECRET", "synthetic-secret")
  vi.stubEnv("VVM_EXPORT_RESEND_API_KEY", "synthetic-key")
  vi.stubEnv("VVM_EXPORT_FROM_EMAIL", "website@example.com")
  rpc.mockReset().mockResolvedValue({ data: true, error: null })
  fetchMock.mockReset().mockImplementation(async () => Response.json({ id: "email-1" }))
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => vi.unstubAllGlobals())
const sent = () => JSON.parse(fetchMock.mock.calls[0][1].body)

describe("contact message routing", () => {
  it("sends each clinic's messages to its own inbox", () => {
    const routes = Object.fromEntries(CLINIC_LOCATIONS.map(l => [l.id, contactRecipientFor(l)]))
    expect(routes).toEqual({
      whitby: "whitby@valleyviewmedical.ca",
      oshawa: "oshawa@valleyviewmedical.ca",
      courtice: "courtice@valleyviewmedical.ca",
      "lansdowne-mall": "clinic.css@valleyviewmedical.ca",
      "peterborough-pharmacy": "clinic.lss@valleyviewmedical.ca",
      "lynden-road": "clinic.lynden@valleyviewmedical.ca",
      "colborne-east": "clinic.colborne@valleyviewmedical.ca",
    })
  })
  it("validates required contact details, clinic and the honeypot", () => {
    expect(contactSchema.safeParse(message).success).toBe(true)
    for (const bad of [{ clinic: "unknown" }, { email: "nope" }, { phone: "123" }, { message: " " }, { message: "x".repeat(2001) }, { website: "spam" }]) {
      expect(contactSchema.safeParse({ ...message, ...bad }).success).toBe(false)
    }
    expect(contactSchema.safeParse({ ...message, firstName: undefined, lastName: undefined }).success).toBe(true)
  })
})

describe("POST /api/contact", () => {
  it("emails the chosen clinic with the sender as reply-to and an idempotency key", async () => {
    const res = await POST(request())
    expect(res.status).toBe(200)
    expect(res.headers.get("cache-control")).toBe("no-store")
    const body = sent()
    expect(body.to).toBe("oshawa@valleyviewmedical.ca")
    expect(body.reply_to).toBe("visitor@example.com")
    expect(body.subject).toBe("Website message — Oshawa (Harmony)")
    expect(body.text).toContain("Phone: 416-555-0100")
    expect(body.text).toContain(message.message)
    expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"]).toBe(`valleyview-contact/${message.submissionId}`)
  })
  it("rejects other origins, bad input and oversized bodies before sending", async () => {
    expect((await POST(request(message, "https://evil.example"))).status).toBe(403)
    expect((await POST(request({ ...message, email: "nope" }))).status).toBe(400)
    expect((await POST(request(undefined, undefined, JSON.stringify({ ...message, message: "x".repeat(9000) })))).status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(rpc).not.toHaveBeenCalled()
  })
  it("enforces the persistent sender limit and fails closed without it", async () => {
    rpc.mockResolvedValue({ data: false, error: null })
    expect((await POST(request())).status).toBe(429)
    rpc.mockResolvedValue({ data: null, error: { message: "private detail" } })
    const res = await POST(request())
    expect(res.status).toBe(503)
    expect(await res.text()).not.toContain("private detail")
    vi.stubEnv("VVM_CHAT_RATE_LIMIT_SECRET", "")
    expect((await POST(request())).status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it("reports a safe error when email sending fails or is not configured", async () => {
    fetchMock.mockResolvedValue(new Response("provider detail", { status: 500 }))
    const res = await POST(request())
    expect(res.status).toBe(503)
    expect(await res.text()).not.toContain("provider detail")
    vi.stubEnv("VVM_EXPORT_RESEND_API_KEY", "")
    expect((await POST(request())).status).toBe(503)
  })
  it("never sends from a Vercel preview", async () => {
    vi.stubEnv("VERCEL_ENV", "preview")
    expect((await POST(request())).status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
