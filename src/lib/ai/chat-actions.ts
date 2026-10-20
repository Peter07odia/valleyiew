import { CLINIC_LOCATIONS, type ClinicLocation } from "@/config/clinic"
import { getGoogleMapsDirectionsUrl } from "@/lib/constants"

export type ChatActionKind = "book" | "register" | "directions" | "call" | "location" | "link"

export interface ChatAction {
  kind: ChatActionKind
  label: string
  href: string
  external: boolean
}

const MAX_ACTIONS = 4
/** The assistant ends a reply with this when the visitor should pick a clinic. */
export const CHOOSE_CLINIC_MARKER = "[[choose-clinic]]"
const URL_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+|\/(?:new-patient-form|locations)[^\s)]*)/g
const digits = (value: string) => value.replace(/\D/g, "").slice(-10)

function clinicFromQuery(href: string): ClinicLocation | undefined {
  const slug = /[?&]clinic=([a-z-]+)/.exec(href)?.[1]
  return CLINIC_LOCATIONS.find(l => l.slug === slug)
}

/** Turns one link from an assistant reply into a labelled button. */
function actionForUrl(rawHref: string): ChatAction {
  const href = rawHref.replace(/[.,;:!?]+$/, "")
  const booking = CLINIC_LOCATIONS.find(l => l.bookingUrl && href === l.bookingUrl)
  if (booking) return { kind: "book", label: `Book at ${booking.shortName}`, href, external: true }
  if (href.startsWith("/new-patient-form")) {
    const clinic = clinicFromQuery(href)
    return { kind: "register", label: clinic ? `Register at ${clinic.shortName}` : "New patient registration", href, external: false }
  }
  if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl/.test(href)) return { kind: "directions", label: "Directions", href, external: true }
  const page = /^\/locations\/([a-z-]+)/.exec(href)?.[1]
  const location = CLINIC_LOCATIONS.find(l => l.slug === page)
  if (location) return { kind: "location", label: `View ${location.shortName}`, href, external: false }
  return { kind: "link", label: "Open link", href, external: /^https?:/.test(href) }
}

/**
 * Splits an assistant reply into readable text plus action buttons: links become
 * buttons (Book, Register, Directions…), and a clinic's phone number or address
 * in the reply adds Call and Directions buttons for that clinic.
 */
export function extractChatActions(reply: string): { text: string; actions: ChatAction[]; chooseClinic: boolean } {
  const chooseClinic = reply.includes(CHOOSE_CLINIC_MARKER)
  // Also hide a marker that is still streaming in.
  const text = reply.split(CHOOSE_CLINIC_MARKER).join("").replace(/\[\[[a-z-]*\]?$/, "").trimEnd()
  const actions: ChatAction[] = []
  const cleaned = text
    .replace(URL_PATTERN, (_match, label: string | undefined, mdHref: string | undefined, bare: string | undefined) => {
      actions.push(actionForUrl(mdHref ?? bare ?? ""))
      return label ? label : "\u0000"
    })
    // "…online here: <link>." reads as "…online below."
    .replace(/(?:\s+here)?\s*:?\s*\u0000[.,]?/g, " below.")
    .replace(/[ \t]+$/gm, "")

  const mentionedPhones = new Set((text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) ?? []).map(digits))
  for (const location of CLINIC_LOCATIONS) {
    if (location.phone && mentionedPhones.has(digits(location.phone))) {
      actions.push({ kind: "call", label: `Call ${location.shortName}`, href: `tel:${digits(location.phone)}`, external: false })
    }
    if (location.address && text.includes(location.address)) {
      actions.push({ kind: "directions", label: `Directions to ${location.shortName}`, href: getGoogleMapsDirectionsUrl(location), external: true })
    }
  }

  const seen = new Set<string>()
  const unique = actions.filter(action => {
    // One Directions button per destination, whichever way the reply gave it.
    const key = action.kind === "directions" ? `directions:${action.href.split("destination=")[1] ?? action.href}` : action.href
    if (!action.href || seen.has(key)) return false
    seen.add(key)
    return true
  })
  return { text: cleaned, actions: unique.slice(0, MAX_ACTIONS), chooseClinic }
}
