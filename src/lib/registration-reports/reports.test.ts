import { beforeEach, describe, expect, it, vi } from "vitest";
import ExcelJS from "exceljs";
import { buildRegistrationWorkbook } from "./workbook";
const { getUser, cookieGet, rpc, from } = vi.hoisted(() => ({ getUser: vi.fn(), cookieGet: vi.fn(), rpc: vi.fn(), from: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: cookieGet }) }));
vi.mock("@/lib/registration/server", () => ({ decryptRegistrationHealthCard: () => "0123456789", getRegistrationClient: () => ({ auth: { getUser }, rpc, from }) }));
import { reportUser, validReportOrigin } from "./auth";
import { GET } from "@/app/api/registration-reports/download/route";
beforeEach(() => {
  vi.stubEnv("VVM_REPORTS_ENABLED", "true");
  vi.stubEnv("BRANTFORD_REPORTS_EMAIL", "valleyviewlynden@gmail.com");
  vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON", "");
  cookieGet.mockReset(); getUser.mockReset(); from.mockReset();
});
describe("Production registration reports", () => {
  it("allows temporary test access only while explicitly configured", async () => {
    cookieGet.mockReturnValue({ value: "test-token" });
    getUser.mockResolvedValue({ data: { user: { email: "peter89odia@gmail.com" } }, error: null });
    expect(await reportUser()).toBeNull();
    vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON", JSON.stringify({whitby: ["peter89odia@gmail.com"]}));
    expect(await reportUser()).not.toBeNull();
    vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON", "");
    expect(await reportUser()).toBeNull();
  });
  it("denies anonymous downloads before querying any data", async () => {
    expect((await GET()).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });
  it("denies other Supabase accounts and invalid sessions", async () => {
    cookieGet.mockReturnValue({ value: "test-token" });
    getUser.mockResolvedValue({ data: { user: { email: "someone@example.com" } }, error: null });
    expect(await reportUser()).toBeNull();
    getUser.mockResolvedValue({ data: { user: null }, error: {} });
    expect(await reportUser()).toBeNull();
  });
  it("requires the approved account and enabled reports", async () => {
    cookieGet.mockReturnValue({ value: "test-token" });
    getUser.mockResolvedValue({ data: { user: { email: "valleyviewlynden@gmail.com" } }, error: null });
    expect(await reportUser()).not.toBeNull();
    vi.stubEnv("VVM_REPORTS_ENABLED", "false");
    expect(await reportUser()).toBeNull();
  });
  it("rejects other origins for sign-in and test submissions", () => {
    expect(validReportOrigin(new Request("https://valleyviewbrantford.ca/api", { headers: { Origin: "https://evil.example" } }))).toBe(false);
  });
  it("exports every registration to its clinic tab, with dates, literal text and OHIP as text", async () => {
    const sample = (id: string, location: string) => ({ id, preferred_location: location, created_at: "2026-09-10T01:00:00Z", data: { firstName: "=HYPERLINK(\"https://example.com\")", phone: "05195550100", dateOfBirth: "1990-01-01", consent: true, ohipNumber: "9999999999", healthCardProvince: "ON", ohipVersionCode: "AB" } });
    const bytes = await buildRegistrationWorkbook([sample("a", "lynden-road"), sample("b", "colborne-east"), sample("c", "lynden-road")]);
    const book = new ExcelJS.Workbook(); await book.xlsx.load(bytes);
    expect(book.worksheets.map(s => s.name)).toEqual(["Whitby", "Oshawa", "Courtice", "Peterborough Mall", "Peterborough Pharmacy", "Lynden", "Colborne"]);
    expect(book.getWorksheet("Lynden")!.rowCount).toBe(5);
    expect(book.getWorksheet("Colborne")!.rowCount).toBe(4);
    expect(book.getWorksheet("Lynden")!.getCell("C4").type).toBe(ExcelJS.ValueType.String);
    expect(book.getWorksheet("Lynden")!.getCell("F4").value).toBe("05195550100");
    expect(book.getWorksheet("Lynden")!.getCell("G4").value).toBeInstanceOf(Date);
    expect(book.getWorksheet("Lynden")!.getCell("P4").value).toBe("9999999999");
    expect(book.getWorksheet("Lynden")!.getCell("P4").type).toBe(ExcelJS.ValueType.String);
    expect(book.getWorksheet("Lynden")!.getCell("T4").value).toBe("ON");
    expect(book.getWorksheet("Lynden")!.getCell("U4").value).toBe("AB");
  });
  it("queries only the production table and paginates beyond Supabase's row limit", async () => {
    cookieGet.mockReturnValue({ value: "test-token" });
    getUser.mockResolvedValue({ data: { user: { email: "valleyviewlynden@gmail.com" } }, error: null });
    const range = vi.fn().mockResolvedValueOnce({ data: Array.from({ length: 500 }, (_, i) => ({ id: String(i), preferred_location: "lynden-road", created_at: "2026-09-10T01:00:00Z", date_of_birth: "1990-01-01", ohip_encrypted: "mock-ciphertext" })), error: null }).mockResolvedValueOnce({ data: [], error: null });
    const chain = { in: vi.fn(), select: vi.fn(), lte: vi.fn(), order: vi.fn(), range }; chain.in.mockReturnValue(chain); chain.select.mockReturnValue(chain); chain.lte.mockReturnValue(chain); chain.order.mockReturnValue(chain); from.mockReturnValue(chain);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(from).toHaveBeenCalledTimes(2);
    expect(from).toHaveBeenCalledWith("valleyview_patient_registrations");
    expect(chain.in).toHaveBeenCalledWith("preferred_location", expect.arrayContaining(["whitby", "lynden-road", "colborne-east"]));
    expect(range).toHaveBeenNthCalledWith(2, 500, 999);
  });
  it("limits staff to permitted clinics and adds legacy Brantford rows only for Brantford access", async () => {
    vi.stubEnv("VVM_INCLUDE_LEGACY_REPORTS", "true");
    vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON", JSON.stringify({ whitby: ["whitby-staff@example.com"], "lynden-road": ["brantford-staff@example.com"] }));
    cookieGet.mockReturnValue({ value: "test-token" });
    const run = async (email: string) => {
      from.mockReset();
      getUser.mockResolvedValue({ data: { user: { email } }, error: null });
      const chain = { in: vi.fn(), select: vi.fn(), lte: vi.fn(), order: vi.fn(), range: vi.fn().mockResolvedValue({ data: [], error: null }) };
      chain.in.mockReturnValue(chain); chain.select.mockReturnValue(chain); chain.lte.mockReturnValue(chain); chain.order.mockReturnValue(chain); from.mockReturnValue(chain);
      const response = await GET();
      const book = new ExcelJS.Workbook(); await book.xlsx.load(await response.arrayBuffer());
      return { status: response.status, tables: from.mock.calls.map(([table]) => table), scopes: chain.in.mock.calls.map(([, ids]) => ids), sheets: book.worksheets.map(sheet => sheet.name) };
    };
    const whitby = await run("whitby-staff@example.com");
    expect(whitby.status).toBe(200);
    expect(whitby.tables).toEqual(["valleyview_patient_registrations"]);
    expect(whitby.scopes).toEqual([["whitby"]]);
    expect(whitby.sheets).toEqual(["Whitby"]);
    const brantford = await run("brantford-staff@example.com");
    expect(brantford.tables).toEqual(["valleyview_patient_registrations", "brantford_patient_registrations"]);
    expect(brantford.scopes).toEqual([["lynden-road"], ["lynden-road"]]);
    expect(brantford.sheets).toEqual(["Lynden"]);
    expect((await GET()).status).toBe(200);
    getUser.mockResolvedValue({ data: { user: { email: "colborne-staff@example.com" } }, error: null });
    expect((await GET()).status).toBe(401);
  });
});
