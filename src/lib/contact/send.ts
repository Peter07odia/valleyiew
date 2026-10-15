import "server-only"
import type { ClinicLocation } from "@/config/clinic"
import type { ContactMessage } from "./schema"
import { contactRecipientFor } from "./recipients"

const formatPhone = (digits: string) => {
  const local = digits.slice(-10)
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`
}

/** Sends a website message to the chosen clinic's inbox. Returns the provider id. */
export async function sendContactMessage(message: ContactMessage, location: ClinicLocation): Promise<string> {
  const key = process.env.VVM_EXPORT_RESEND_API_KEY
  const sender = process.env.VVM_EXPORT_FROM_EMAIL
  if (!key || !sender) throw new Error("Contact email is not configured")
  const name = [message.firstName, message.lastName].filter(Boolean).join(" ") || "Not provided"
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // A retried submission never sends the same message twice.
      "Idempotency-Key": `valleyview-contact/${message.submissionId}`,
    },
    body: JSON.stringify({
      from: `Valleyview Medical Centre website <${sender}>`,
      to: contactRecipientFor(location),
      reply_to: message.email,
      subject: `Website message — ${location.shortName}`,
      text: [
        `A visitor sent a message through the Valleyview website for ${location.name}.`,
        "",
        `Name: ${name}`,
        `Email: ${message.email}`,
        `Phone: ${formatPhone(message.phone)}`,
        "",
        "Message:",
        message.message,
        "",
        "Reply to this email to respond to the sender.",
      ].join("\n"),
    }),
  })
  if (!response.ok) throw new Error("Message could not be sent")
  const data = await response.json()
  if (!data?.id) throw new Error("Message could not be sent")
  return data.id as string
}
