import { describe, expect, it } from "vitest";
import { healthCardProvinces, parseHealthCard, type HealthCardProvince } from "./health-card";

const samples: Record<HealthCardProvince, string> = {
  ON: "0000-000-000", AB: "00000-0000", BC: "0000 000 000", MB: "000000000",
  NB: "000-000-000", NL: "000 000 000 000", NS: "0000 000 000", NT: "a0000000",
  NU: "000000000", PE: "00000000", QC: "abcd 0000 0000", SK: "000000000", YT: "003000000",
};
describe("Canadian health-card formats (synthetic numbers only)", () => {
  it.each(healthCardProvinces)("accepts the published %s structure and preserves leading zeros", province => {
    const result = parseHealthCard(province, samples[province]);
    expect(result.error).toBe("");
    expect(result.number).toBe(samples[province].replace(/[ -]/g, "").toUpperCase());
    expect(parseHealthCard(province, "123").error).not.toBe("");
  });
  it.each(["0000000000ab", "0000-000-000 AB", " 0000 000 000 ab "])("extracts pasted Ontario version letters from %s", value => {
    expect(parseHealthCard("ON", value)).toEqual({number:"0000000000",versionCode:"AB",error:""});
  });
  it("accepts separate letters, one letter and cards with no version", () => {
    expect(parseHealthCard("ON", "0000000000", "ab").versionCode).toBe("AB");
    expect(parseHealthCard("ON", "0000000000 A").error).toBe("");
    expect(parseHealthCard("ON", "0000000000").versionCode).toBe("");
    expect(parseHealthCard("ON", "0000000000AB", "AB").error).toBe("");
  });
  it("rejects conflicting codes, invalid letters and numbers belonging to another province", () => {
    expect(parseHealthCard("ON", "0000000000AB", "CD").error).toContain("do not match");
    for (const code of ["ABC", "A1", "I", "O"]) expect(parseHealthCard("ON", "0000000000", code).error).not.toBe("");
    expect(parseHealthCard("ON", "ABCD00000000").error).not.toBe("");
    expect(parseHealthCard("QC", "ABCD00000000", "AB").error).not.toBe("");
    expect(parseHealthCard("MB", "A00000").error).toContain("PHIN");
  });
});
