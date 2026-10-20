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

// Interim (user request 2026-10-20): until the clinic mailboxes exist, every form
// goes to the shared inbox used before. Set to null to switch to the clinic inboxes.
export const INTERIM_FORM_INBOX: string | null = "valleyviewlynden@gmail.com"

export function formInboxFor(clinicId: string): string | undefined {
  return INTERIM_FORM_INBOX ?? CLINIC_FORM_INBOXES[clinicId]
}

export function contactRecipientFor(location: Pick<ClinicLocation, "id">): string {
  const email = formInboxFor(location.id)
  if (!email) throw new Error("No form inbox for this clinic")
  return email
}
