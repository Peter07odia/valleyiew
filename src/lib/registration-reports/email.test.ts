import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyRegistration } from "./email";
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("VVM_REPORTS_ENABLED", "true");
  vi.stubEnv("VVM_EXPORT_RESEND_API_KEY", "synthetic-key");
  vi.stubEnv("VVM_EXPORT_FROM_EMAIL", "reports@example.com");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://valleyviewmedical.ca");
  vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON", JSON.stringify({ whitby: ["whitby-staff@example.com"], "lynden-road": ["brantford-a@example.com", "brantford-b@example.com"] }));
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => Response.json({ id: `email-${fetchMock.mock.calls.length}` }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
const sentTo = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).to);
describe("registration notification routing", () => {
  it("emails only staff approved for the registration's clinic", async () => {
    expect(await notifyRegistration("synthetic-id", "whitby")).toBe("email-1");
    expect(sentTo()).toEqual(["whitby-staff@example.com"]);
    fetchMock.mockClear();
    await notifyRegistration("synthetic-id-2", "lynden-road");
    expect(sentTo()).toEqual(["brantford-a@example.com", "brantford-b@example.com"]);
  });
  it("fails closed for a clinic without approved recipients", async () => {
    await expect(notifyRegistration("synthetic-id", "oshawa")).rejects.toThrow("No authorized recipient");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("sends a sign-in link without patient details and a per-recipient idempotency key", async () => {
    await notifyRegistration("synthetic-id", "lynden-road");
    const [[, first], [, second]] = fetchMock.mock.calls;
    const body = JSON.parse(first.body);
    expect(body.text).toContain("https://valleyviewmedical.ca/registration-reports");
    expect(body.text).not.toMatch(/synthetic-id|lynden|health card|\d{10}/i);
    expect(first.headers["Idempotency-Key"]).toMatch(/^valleyview-registration\/synthetic-id\/[a-f0-9]{20}$/);
    expect(first.headers["Idempotency-Key"]).not.toBe(second.headers["Idempotency-Key"]);
  });
});
