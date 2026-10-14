import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDecipheriv } from "node:crypto";
import { registrationSchema } from "./schema";
import { decryptRegistrationHealthCard, registrationRecord } from "./server";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc }) }));
import { POST } from "@/app/api/registration/route";

const fixture = {
  submissionId: "19c0b8d7-bd91-4020-ab93-9d933697051a", firstName: "Synthetic", lastName: "Test",
  email: "synthetic@example.com", phone: "519-555-0100", dateOfBirth: "1990-01-01",
  gender: "Prefer not to say", address: "123 Test Street", city: "Brantford", postalCode: "N3S 7S8",
  preferredLocation: "lynden-road", ohipNumber: "0000000000", conditions: "None", medications: "None", comments: "", consent: true,
};
function request(body: unknown = fixture, origin = "http://localhost:3200") {
  return new Request("http://localhost:3200/api/registration", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VVM_REGISTRATION_SUPABASE_URL", "https://mdstlgpuzstyknmyfovc.supabase.co");
  vi.stubEnv("VVM_REGISTRATION_SERVICE_ROLE_KEY", "test-only");
  vi.stubEnv("VVM_REGISTRATION_ENC_KEY", Buffer.alloc(32, 7).toString("base64"));
  rpc.mockReset().mockResolvedValue({ error: null });
});
describe("Unified registrations", () => {
  it.each(["whitby", "oshawa", "courtice", "lansdowne-mall", "peterborough-pharmacy", "lynden-road", "colborne-east"])("accepts %s and normalizes contact details", (preferredLocation) => {
    const result = registrationSchema.parse({ ...fixture, preferredLocation });
    expect(result.phone).toBe("5195550100");
    expect(result.postalCode).toBe("N3S7S8");
  });
  it.each([{ preferredLocation: "unknown-clinic" }, { consent: false }, { dateOfBirth: "2990-01-01" }, { dateOfBirth: "2000-02-30" }, { ohipNumber: "123" }, { comments: "x".repeat(4001) }, { website: "spam" }])("rejects invalid or unauthorized form values: %j", (change) => {
    expect(registrationSchema.safeParse({ ...fixture, ...change }).success).toBe(false);
  });
  it("encrypts OHIP with authenticated encryption and stable retry hashes", () => {
    const data = registrationSchema.parse(fixture);
    const first = registrationRecord(data, "synthetic-ip");
    const second = registrationRecord(data, "synthetic-ip");
    expect(first.ohip_encrypted).not.toBe(second.ohip_encrypted);
    expect(first.payload_hash).toBe(second.payload_hash);
    expect(first.request_fingerprint).not.toContain("synthetic-ip");
    const bytes = Buffer.from(first.ohip_encrypted.slice(2), "hex");
    const decipher = createDecipheriv("aes-256-gcm", Buffer.alloc(32, 7), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    expect(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString()).toBe(fixture.ohipNumber);
  });
  it("saves only to the unified RPC and returns no patient data", async () => {
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("submit_valleyview_registration", { registration: expect.objectContaining({ preferred_location: "lynden-road" }) });
  });
  it("decrypts health cards including leading zeros and rejects tampering or the wrong key", () => {
    const encrypted = registrationRecord(registrationSchema.parse(fixture), "synthetic-ip").ohip_encrypted;
    expect(decryptRegistrationHealthCard(encrypted)).toBe("0000000000");
    expect(() => decryptRegistrationHealthCard(encrypted.slice(0, -2) + (encrypted.endsWith("00") ? "01" : "00"))).toThrow();
    expect(() => decryptRegistrationHealthCard("0000000000")).toThrow();
    vi.stubEnv("VVM_REGISTRATION_ENC_KEY", Buffer.alloc(32, 8).toString("base64"));
    expect(() => decryptRegistrationHealthCard(encrypted)).toThrow();
  });
  it.each([
    ["ON", "0000-000-000 ab", "0000000000AB"],
    ["QC", "abcd 0000 0000", "ABCD00000000"],
    ["NT", "a0000000", "A0000000"],
    ["PE", "00000000", "00000000"],
    ["NL", "000000000000", "000000000000"],
  ])("encrypts and recovers %s card numbers and version letters", (province, input, expected) => {
    const parsed = registrationSchema.parse({ ...fixture, healthCardProvince: province, ohipNumber: input });
    const row = registrationRecord(parsed, "synthetic-ip");
    expect(row.health_card_province).toBe(province);
    expect(decryptRegistrationHealthCard(row.ohip_encrypted)).toBe(expected);
  });
  it("rejects cross-origin and invalid submissions before database access", async () => {
    expect((await POST(request(fixture, "https://another-site.example"))).status).toBe(403);
    expect((await POST(request({ ...fixture, consent: false }))).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each(["https://valleyviewmedical.ca", "https://www.valleyviewmedical.ca"])("accepts the public origin %s with the unified deployment", async (origin) => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(request(fixture, origin))).status).toBe(200);
  });
  it("rejects non-clinic origins in production even when request.url matches", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(request())).status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("bounds request size", async () => {
    expect((await POST(request({ ...fixture, comments: "x".repeat(25000) }))).status).toBe(413);
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each([["P0001", 429], ["P0002", 409], ["XX000", 503]])("handles database %s without leaking details", async (code, status) => {
    rpc.mockResolvedValue({ error: { code, message: "private database detail" } });
    const result = await POST(request());
    expect(result.status).toBe(status);
    expect(await result.text()).not.toContain("private database detail");
  });
  it("fails closed when the registration connection is missing", async () => {
    vi.stubEnv("VVM_REGISTRATION_SERVICE_ROLE_KEY", "");
    expect((await POST(request())).status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });
});
