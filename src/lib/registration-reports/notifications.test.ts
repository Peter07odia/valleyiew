import { beforeEach, describe, expect, it, vi } from "vitest";
const { rpc, notify } = vi.hoisted(() => ({ rpc: vi.fn(), notify: vi.fn() }));
vi.mock("@/lib/registration/server", () => ({ getRegistrationClient: () => ({ rpc }) }));
vi.mock("./email", () => ({ notifyRegistration: notify }));
import { processRegistrationNotifications } from "./notifications";
import { GET, POST } from "@/app/api/registration-reports/notifications/route";
beforeEach(() => {
  vi.stubEnv("VVM_REPORTS_ENABLED", "true");
  vi.stubEnv("BRANTFORD_REPORTS_EMAIL", "clinic@example.com");
  vi.stubEnv("CRON_SECRET", "synthetic-secret");
  rpc.mockReset(); notify.mockReset();
});
describe("durable registration notifications", () => {
  it("rejects unauthenticated processing without querying records", async () => {
    expect((await POST(new Request("https://example.com", { method: "POST" }))).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("accepts the Vercel cron GET only with the bearer secret", async () => {
    const cron = (authorization?: string) => GET(new Request("https://example.com/api/registration-reports/notifications", { headers: authorization ? { authorization } : {} }));
    expect((await cron("Bearer wrong-secret")).status).toBe(401);
    expect((await cron("synthetic-secret")).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
    rpc.mockResolvedValueOnce({ data: [], error: null });
    const response = await cron("Bearer synthetic-secret");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: 0, failed: 0 });
  });
  it.each([true, false])("acknowledges provider success or schedules retry (success=%s)", async success => {
    rpc.mockResolvedValueOnce({ data: [{ registration_id: "synthetic-id", lease_token: "lease", preferred_location: "whitby" }], error: null }).mockResolvedValueOnce({ data: true, error: null });
    if (success) notify.mockResolvedValue("provider-id"); else notify.mockRejectedValue(new Error("unavailable"));
    expect(await processRegistrationNotifications()).toEqual({ sent: success ? 1 : 0, failed: success ? 0 : 1 });
    expect(rpc).toHaveBeenLastCalledWith("finish_valleyview_registration_notification", { job_id: "synthetic-id", claim_token: "lease", provider_id: success ? "provider-id" : null });
  });
  it("leaves unacknowledged sends to the stored lease recovery", async () => {
    rpc.mockResolvedValueOnce({ data: [{ registration_id: "synthetic-id", lease_token: "lease", preferred_location: "whitby" }], error: null }).mockResolvedValueOnce({ error: { message: "database unavailable" } });
    notify.mockResolvedValue("provider-id");
    await expect(processRegistrationNotifications()).rejects.toThrow("acknowledgment");
  });
});
