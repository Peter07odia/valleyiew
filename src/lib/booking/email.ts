import "server-only"
import { Resend } from "resend"
import { CLINIC_CONFIG, getConfiguredSiteUrl } from "@/config/clinic"

const CLINIC_TIME_ZONE = CLINIC_CONFIG.timezone
const CLINIC_NAME = CLINIC_CONFIG.organizationName

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function fromAddress(): string | null {
  const addr = process.env.BOOKING_FROM_EMAIL
  return addr ? `${CLINIC_NAME} <${addr}>` : null
}

function siteUrl(): string {
  return getConfiguredSiteUrl().origin
}

// "Saturday, March 28 at 4:00pm" — Taunton-style long date.
function fmtLong(iso: string | null | undefined): string {
  if (!iso) return "your selected time"
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(d)
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  })
    .format(d)
    .toLowerCase()
    .replace(" ", "")
  return `${date} at ${time}`
}

export interface BookingEmailData {
  to: string
  patientName: string
  when: string | null
  endAt: string | null
  locationName: string
  locationAddress: string | null
  locationPhone: string | null
  locationMapsUrl: string | null
  providerName: string
  appointmentType: string
}

type LifecycleEvent = "requested" | "confirmed" | "declined" | "reminder" | "cancelled"

// ---- building blocks (table-based for email-client compatibility) ----

function header(): string {
  const logo = `${siteUrl()}/images/branding/vvm-logo.png`
  return `
  <tr><td style="padding:0 0 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e1d5;border-radius:10px">
      <tr>
        <td style="padding:18px 22px" valign="middle">
          <img src="${logo}" alt="${CLINIC_NAME}" width="56" height="56" style="vertical-align:middle;border:0" />
          <span style="display:inline-block;margin-left:12px;vertical-align:middle">
            <span style="font-size:18px;font-weight:700;color:#248a7e">${CLINIC_NAME}</span><br/>
            <span style="font-size:13px;color:#5d6b63">Ontario</span>
          </span>
        </td>
      </tr>
    </table>
  </td></tr>`
}

function bigDate(when: string | null): string {
  return `
  <tr><td style="padding:0 0 8px">
    <p style="margin:0;font-size:15px;font-weight:700;color:#1c2e4a">Your appointment is on:</p>
    <p style="margin:4px 0 0;font-size:26px;font-weight:800;color:#1c2e4a;line-height:1.2">${fmtLong(when)}</p>
  </td></tr>`
}

function detailsTable(d: BookingEmailData): string {
  return `
  <tr><td style="padding:14px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
      <tr><td style="padding:5px 0;color:#5d6b63">Provider</td><td style="padding:5px 0;text-align:right;font-weight:600">${d.providerName}</td></tr>
      <tr><td style="padding:5px 0;color:#5d6b63">Visit type</td><td style="padding:5px 0;text-align:right">${d.appointmentType}</td></tr>
      <tr><td style="padding:5px 0;color:#5d6b63">Clinic</td><td style="padding:5px 0;text-align:right">${d.locationName}</td></tr>
    </table>
  </td></tr>`
}

function policyBox(phone: string | null): string {
  const call = phone ? ` or call us at ${phone}` : ""
  return `
  <tr><td style="padding:6px 0 14px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e1d5;border-radius:8px">
      <tr><td style="padding:14px 16px;font-size:13.5px;color:#5d6b63;font-style:italic;line-height:1.6">
        If you need to cancel or reschedule, please let us know as early as possible${call} so we can offer the time to another patient.
      </td></tr>
    </table>
  </td></tr>`
}

function locationBlock(d: BookingEmailData): string {
  if (!d.locationAddress) return ""
  const addr = d.locationMapsUrl
    ? `<a href="${d.locationMapsUrl}" style="color:#248a7e;text-decoration:none">${d.locationAddress}</a>`
    : d.locationAddress
  return `
  <tr><td style="padding:10px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf9;border-radius:8px">
      <tr><td style="padding:16px 18px">
        <p style="margin:0;font-size:15px;font-weight:700;color:#1c2e4a">📍 Our Location</p>
        <p style="margin:6px 0 0;font-size:14px">${addr}</p>
        ${d.locationPhone ? `<p style="margin:4px 0 0;font-size:14px;color:#5d6b63">${d.locationPhone}</p>` : ""}
      </td></tr>
    </table>
  </td></tr>`
}

function footer(): string {
  return `
  <tr><td style="padding:18px 0 0;border-top:1px solid #e5e1d5">
    <p style="margin:0;font-size:13px"><a href="${siteUrl()}" style="color:#248a7e">${siteUrl().replace("https://", "")}</a></p>
    <p style="margin:8px 0 0;font-size:12px;color:#8a958e">This is an automated message from ${CLINIC_NAME}. Please use the clinic's confirmed contact details for changes.</p>
  </td></tr>`
}

function shell(rows: string): string {
  return `
  <div style="background:#f5f2ea;padding:24px 0">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c2e4a;background:#ffffff;border-radius:12px;padding:24px">
          ${rows}
        </table>
      </td></tr>
    </table>
  </div>`
}

function greeting(name: string): string {
  const first = name.split(" ")[0] || "there"
  return `<tr><td style="padding:4px 0"><p style="margin:0;font-size:15px">Dear ${first},</p></td></tr>`
}

function para(text: string): string {
  return `<tr><td style="padding:8px 0"><p style="margin:0;font-size:15px;line-height:1.6">${text}</p></td></tr>`
}

// ---- .ics calendar attachment ----
function buildIcs(d: BookingEmailData): string | null {
  if (!d.when) return null
  const dt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const end = d.endAt ?? new Date(new Date(d.when).getTime() + 30 * 60000).toISOString()
  const uidHost = getConfiguredSiteUrl().hostname || "valleyview-brantford.local"
  const uid = `${dt(d.when)}-${Math.random().toString(36).slice(2)}@${uidHost}`
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Valleyview Medical//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(d.when)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${d.appointmentType} — ${CLINIC_NAME}`,
    d.locationAddress ? `LOCATION:${d.locationAddress.replace(/,/g, "\\,")}` : "",
    `DESCRIPTION:Appointment with ${d.providerName} at ${d.locationName}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")
}

function template(event: LifecycleEvent, d: BookingEmailData): { subject: string; rows: string } {
  switch (event) {
    case "requested":
      return {
        subject: `We received your appointment request — ${CLINIC_NAME}`,
        rows:
          header() +
          bigDate(d.when) +
          greeting(d.patientName) +
          para("Thanks for your request. Our staff will review it and confirm by email shortly. <b>This time is not booked until you receive confirmation.</b>") +
          detailsTable(d) +
          policyBox(d.locationPhone) +
          locationBlock(d) +
          para("We look forward to seeing you soon!<br/>Best regards,<br/>" + CLINIC_NAME) +
          footer(),
      }
    case "confirmed":
      return {
        subject: `Your appointment is confirmed — ${CLINIC_NAME}`,
        rows:
          header() +
          bigDate(d.when) +
          greeting(d.patientName) +
          para("Your appointment is confirmed. Please arrive a few minutes early and bring your health card.") +
          detailsTable(d) +
          policyBox(d.locationPhone) +
          locationBlock(d) +
          para("We look forward to seeing you soon!<br/>Best regards,<br/>" + CLINIC_NAME) +
          footer(),
      }
    case "reminder":
      return {
        subject: `Reminder: your appointment tomorrow — ${CLINIC_NAME}`,
        rows:
          header() +
          bigDate(d.when) +
          greeting(d.patientName) +
          para("This is a friendly reminder of your upcoming appointment.") +
          detailsTable(d) +
          policyBox(d.locationPhone) +
          locationBlock(d) +
          para("We look forward to seeing you!<br/>Best regards,<br/>" + CLINIC_NAME) +
          footer(),
      }
    case "declined":
      return {
        subject: `Update on your appointment request — ${CLINIC_NAME}`,
        rows:
          header() +
          greeting(d.patientName) +
          para(`Unfortunately we couldn't confirm your requested time (${fmtLong(d.when)}). Please book another time on our website${d.locationPhone ? `, or call us at ${d.locationPhone}` : ""} and we'll be glad to help.`) +
          detailsTable(d) +
          locationBlock(d) +
          para("Best regards,<br/>" + CLINIC_NAME) +
          footer(),
      }
    case "cancelled":
      return {
        subject: `Your appointment was cancelled — ${CLINIC_NAME}`,
        rows:
          header() +
          greeting(d.patientName) +
          para(`Your appointment (${fmtLong(d.when)}) has been cancelled. You can book a new time on our website anytime.`) +
          detailsTable(d) +
          locationBlock(d) +
          para("Best regards,<br/>" + CLINIC_NAME) +
          footer(),
      }
  }
}

// Best-effort lifecycle email. Returns false on any failure WITHOUT throwing,
// so booking flows never break.
export async function sendBookingEmail(
  event: LifecycleEvent,
  data: BookingEmailData
): Promise<boolean> {
  const resend = client()
  const from = fromAddress()
  if (!resend || !from || !data.to || !CLINIC_CONFIG.booking.enabled) return false
  const { subject, rows } = template(event, data)

  // Attach a calendar invite for confirmed appointments + reminders.
  const ics = event === "confirmed" || event === "reminder" ? buildIcs(data) : null
  const attachments = ics
    ? [{ filename: "appointment.ics", content: Buffer.from(ics).toString("base64") }]
    : undefined

  try {
    const { error } = await resend.emails.send({
      from,
      to: data.to,
      subject,
      html: shell(rows),
      attachments,
    })
    return !error
  } catch {
    return false
  }
}
