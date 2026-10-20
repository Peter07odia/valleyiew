import type { ClinicLocation } from "@/config/clinic"

// User-approved on 2026-10-19: every website form for a clinic (contact
// messages and registration alerts) goes to that clinic's own mailbox.
export const CLINIC_FORM_INBOXES: Record<string, string> = {
  whitby: "whitby@valleyviewmedical.ca",
  oshawa: "oshawa@valleyviewmedical.ca",
  courtice: "courtice@valleyviewmedical.ca",
  "lansdowne-mall": "clinic.css@valleyviewmedical.ca",
  "peterborough-pharmacy": "clinic.lss@valleyviewmedical.ca",
  "lynden-road": "clinic.lynden@valleyviewmedical.ca",
  "colborne-east": "clinic.colborne@valleyviewmedical.ca",
}

export function contactRecipientFor(location: Pick<ClinicLocation, "id">): string {
  const email = CLINIC_FORM_INBOXES[location.id]
  if (!email) throw new Error("No form inbox for this clinic")
  return email
}
