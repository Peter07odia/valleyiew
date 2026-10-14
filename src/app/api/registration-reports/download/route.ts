import { clinicsForEmail } from "@/lib/registration-reports/access";
import { decryptRegistrationHealthCard, getRegistrationClient } from "@/lib/registration/server";
import { reportResponse, reportUser } from "@/lib/registration-reports/auth";
import { buildRegistrationWorkbook, type ReportRow } from "@/lib/registration-reports/workbook";
import { parseHealthCard, type HealthCardProvince } from "@/lib/registration/health-card";
export const runtime = "nodejs";
export async function GET() {
  const user = await reportUser();
  if (!user?.email) return reportResponse({ error: "Sign in to download the spreadsheet." }, 401);
  try {
    const allowedLocations = clinicsForEmail(user.email);
    if (!allowedLocations.length) return reportResponse({ error: "No authorized clinics." }, 403);
    const rows: ReportRow[] = [];
    const client = getRegistrationClient();
    const cutoff = new Date().toISOString();
    // Legacy rows only ever belonged to the two Brantford clinics; other staff never touch that table.
    const legacy = process.env.VVM_INCLUDE_LEGACY_REPORTS === "true" && allowedLocations.some(id => id === "lynden-road" || id === "colborne-east");
    const sources = ["valleyview_patient_registrations", ...(legacy ? ["brantford_patient_registrations"] : [])];
    for (const table of sources) {
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from(table).select("id,created_at,preferred_location,first_name,last_name,email,phone,date_of_birth,gender,address,city,postal_code,health_card_province,ohip_encrypted,conditions,medications,comments,status,consent_at,consent_version").in("preferred_location", allowedLocations).lte("created_at", cutoff).order("created_at").order("id").range(offset, offset + 499);
      if (error) throw new Error("Export query failed");
      rows.push(...data.map(item => {
        const province = (item.health_card_province ?? "ON") as HealthCardProvince;
        const card = parseHealthCard(province, decryptRegistrationHealthCard(item.ohip_encrypted, table === "brantford_patient_registrations"));
        if (card.error) throw new Error("Stored card format invalid");
        return { id: item.id, created_at: item.created_at, preferred_location: item.preferred_location, data: {
        firstName: item.first_name, lastName: item.last_name, email: item.email, phone: item.phone,
        dateOfBirth: item.date_of_birth, gender: item.gender, address: item.address, city: item.city,
        postalCode: item.postal_code, conditions: item.conditions, medications: item.medications,
        comments: item.comments, status: item.status, consent: !!item.consent_at,
        consentAt: item.consent_at, consentVersion: item.consent_version,
        ohipNumber: card.number, ohipVersionCode: card.versionCode, healthCardProvince: province,
      } }; }));
      if (data.length < 500) break;
    }
    }
    return new Response(new Uint8Array(await buildRegistrationWorkbook(rows, allowedLocations)), { headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="valleyview-patient-registrations.xlsx"',
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch { return reportResponse({ error: "The spreadsheet could not be generated. Please try again." }, 503); }
}
