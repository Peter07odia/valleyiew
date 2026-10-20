import { beforeEach, describe, expect, it, vi } from "vitest";
import { clinicAccess, clinicsForEmail, recipientsForClinic } from "./access";
import { formInboxFor } from "@/lib/contact/recipients";
import { buildRegistrationWorkbook } from "./workbook";
import ExcelJS from "exceljs";
beforeEach(()=>vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON", ""));
describe("seven-clinic staff separation",()=>{
  it("gives each clinic's form inbox access to that clinic only by default",()=>{
    expect(clinicsForEmail(formInboxFor("whitby")!)).toContain("whitby");
    expect(clinicsForEmail(formInboxFor("colborne-east")!)).toContain("colborne-east");
    expect(clinicsForEmail("peter89odia@gmail.com")).toEqual([]);
  });
  it("replaces the central fallback and does not grant access to omitted clinics",()=>{
    vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON",JSON.stringify({whitby:["WHITBY@example.com"],"lynden-road":["lynden@example.com"]}));
    expect(clinicsForEmail("whitby@example.com")).toEqual(["whitby"]);
    expect(clinicsForEmail("oshawa@valleyviewmedical.ca")).toEqual([]);
    expect(recipientsForClinic("oshawa")).toEqual([]);
    expect(recipientsForClinic("lynden-road")).toEqual(["lynden@example.com"]);
  });
  it("fails closed on malformed access configuration",()=>{
    vi.stubEnv("VVM_REPORT_RECIPIENTS_JSON",'{"whitby":"everyone"}');expect(()=>clinicAccess()).toThrow();
  });
  it("exports only permitted sheets and rows even if supplied other-clinic data",async()=>{
    const bytes=await buildRegistrationWorkbook([
      {id:"allowed",created_at:"2026-10-14T00:00:00Z",preferred_location:"whitby",data:{firstName:"Allowed",dateOfBirth:"1990-01-01"}},
      {id:"forbidden",created_at:"2026-10-14T00:00:00Z",preferred_location:"lynden-road",data:{firstName:"Forbidden",dateOfBirth:"1990-01-01"}},
    ],["whitby"]);
    const book=new ExcelJS.Workbook();await book.xlsx.load(bytes);
    expect(book.worksheets.map(s=>s.name)).toEqual(["Whitby"]);
    expect(book.worksheets[0].getCell("A4").value).toBe("allowed");
    expect(book.worksheets[0].rowCount).toBe(4);
  });
});
