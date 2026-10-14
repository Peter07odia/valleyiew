import { registrationLocationIds, registrationSheetNames, type RegistrationLocationId } from "@/lib/registration/locations";
import ExcelJS from "exceljs";
export type ReportRow = { id: string; created_at: string; preferred_location: string; data: Record<string, unknown> };
const columns = [
  ["Registration ID", "id", 39], ["Submitted (UTC)", "created_at", 24],
  ["First name", "firstName", 20], ["Last name", "lastName", 24], ["Email", "email", 34],
  ["Phone", "phone", 18], ["Date of birth", "dateOfBirth", 16], ["Gender", "gender", 26],
  ["Address", "address", 34], ["City", "city", 20], ["Postal code", "postalCode", 15],
  ["Medical conditions", "conditions", 45], ["Medications", "medications", 45],
  ["Comments", "comments", 45], ["Consent", "consent", 14],
  ["Health card number", "ohipNumber", 23], ["Registration status", "status", 22],
  ["Consent date (UTC)", "consentAt", 24], ["Consent version", "consentVersion", 18],
  ["Health card province/territory", "healthCardProvince", 28], ["Ontario version code", "ohipVersionCode", 22],
] as const;
export async function buildRegistrationWorkbook(rows: ReportRow[], allowedLocations: string[] = [...registrationLocationIds]) {
  const book = new ExcelJS.Workbook();
  book.creator = "Valleyview Medical Centre";
  book.created = new Date();
  for (const location of registrationLocationIds.filter(id => allowedLocations.includes(id))) {
    const name = registrationSheetNames[location as RegistrationLocationId];
    const sheet = book.addWorksheet(name, { views: [{ state: "frozen", ySplit: 3 }] });
    sheet.columns = columns.map(([header, key, width]) => ({ header, key, width }));
    sheet.spliceRows(1, 0, ["Valleyview — Patient registrations"], ["Confidential clinic records · Includes health card numbers · Dates and submission times are UTC."]);
    sheet.mergeCells(1, 1, 1, columns.length); sheet.mergeCells(2, 1, 2, columns.length);
    sheet.getRow(1).font = { bold: true, size: 16, color: { argb: "FF143044" } };
    sheet.getRow(1).height = 30; sheet.getRow(2).height = 24;
    sheet.getRow(3).height = 30;
    sheet.getRow(3).eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF143044" } }; cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; });
    for (const item of rows.filter(row => row.preferred_location === location)) {
      const row = sheet.addRow(columns.map(([, key]) => {
        if (key === "id") return item.id;
        if (key === "created_at") return new Date(item.created_at);
        if (key === "dateOfBirth") return new Date(String(item.data[key]) + "T00:00:00Z");
        if (key === "consentAt") return item.data[key] ? new Date(String(item.data[key])) : "";
        if (key === "consent") return item.data[key] === true ? "Yes" : "No";
        // Plain string cells: user text is never interpreted as a formula or link.
        return String(item.data[key] ?? "");
      }));
      row.height = 48; row.alignment = { vertical: "top", wrapText: true };
      row.getCell(2).numFmt = "yyyy-mm-dd hh:mm";
      row.getCell(7).numFmt = "yyyy-mm-dd";
      row.getCell(16).numFmt = "@";
      row.getCell(18).numFmt = "yyyy-mm-dd hh:mm";
    }
    sheet.autoFilter = { from: { row: 3, column: 1 }, to: { row: Math.max(3, sheet.rowCount), column: columns.length } };
  }
  return book.xlsx.writeBuffer();
}
