// Format checks only, not verification of coverage or card validity.
// CIHI Acute and Ambulatory Care Data Content Standard (April 2026), Appendix C.
export const healthCardProvinces = ["ON", "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "PE", "QC", "SK", "YT"] as const;
export type HealthCardProvince = typeof healthCardProvinces[number];
export const healthCardFormats: Record<HealthCardProvince, { name: string; pattern: RegExp; hint: string }> = {
  ON: { name: "Ontario", pattern: /^\d{10}$/, hint: "10 digits. You can also paste the version letters after the number." },
  AB: { name: "Alberta", pattern: /^\d{9}$/, hint: "9-digit personal health number (PHN)." },
  BC: { name: "British Columbia", pattern: /^\d{10}$/, hint: "10-digit personal health number (PHN), on the back of a combined driver's licence / Services Card." },
  MB: { name: "Manitoba", pattern: /^\d{9}$/, hint: "9-digit personal health identification number (PHIN), not the 6-character family registration number." },
  NB: { name: "New Brunswick", pattern: /^\d{9}$/, hint: "9-digit Medicare number." },
  NL: { name: "Newfoundland and Labrador", pattern: /^\d{12}$/, hint: "12-digit Medical Care Plan (MCP) number." },
  NS: { name: "Nova Scotia", pattern: /^\d{10}$/, hint: "10-digit Medical Services Insurance (MSI) number." },
  NT: { name: "Northwest Territories", pattern: /^[A-Z]\d{7}$/, hint: "1 letter followed by 7 digits." },
  NU: { name: "Nunavut", pattern: /^\d{9}$/, hint: "9-digit health care number." },
  PE: { name: "Prince Edward Island", pattern: /^\d{8}$/, hint: "8-digit personal health number." },
  QC: { name: "Quebec", pattern: /^[A-Z]{4}\d{8}$/, hint: "4 letters followed by 8 digits." },
  SK: { name: "Saskatchewan", pattern: /^\d{9}$/, hint: "9-digit health services number." },
  YT: { name: "Yukon", pattern: /^\d{9}$/, hint: "9-digit health care number, including any leading zeros." },
};
export function parseHealthCard(province: HealthCardProvince, input: string, version = "") {
  let number = input.toUpperCase().replace(/[\s-]/g, "");
  let versionCode = version.trim().toUpperCase();
  let error = "";
  if (province === "ON") {
    const combined = /^(\d{10})([A-Z]{1,2})$/.exec(number);
    if (combined) {
      number = combined[1];
      if (versionCode && versionCode !== combined[2]) error = "The version letters entered in the two fields do not match.";
      versionCode ||= combined[2];
    }
    if (versionCode && !/^[A-HJ-NP-Z]{1,2}$/.test(versionCode)) error = "Enter the 1 or 2 version letters printed on your card (I and O are not used).";
  } else if (versionCode) error = "A separate Ontario version code does not apply to the selected province or territory.";
  if (!healthCardFormats[province].pattern.test(number)) error = `Check your ${healthCardFormats[province].name} health card number. ${healthCardFormats[province].hint}`;
  return { number, versionCode, error };
}
