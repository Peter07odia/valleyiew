import { describe, expect, it } from "vitest"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { getGoogleMapsDirectionsUrl } from "@/lib/constants"
import { extractChatActions } from "./chat-actions"

const oshawa = CLINIC_LOCATIONS.find(l => l.slug === "oshawa")!

describe("chat reply buttons", () => {
  it("turns booking, registration and phone mentions into buttons", () => {
    const { text, actions } = extractChatActions(
      `You can book online here: ${oshawa.bookingUrl}\n\nNew patients can register: /new-patient-form?clinic=oshawa\n\nOr call ${oshawa.phone}.`,
    )
    expect(text).not.toMatch(/https?:|\/new-patient-form/)
    expect(text).toContain("You can book online below.")
    expect(actions.map(a => [a.kind, a.label])).toEqual([
      ["book", `Book at ${oshawa.shortName}`],
      ["register", `Register at ${oshawa.shortName}`],
      ["call", `Call ${oshawa.shortName}`],
    ])
    expect(actions[2].href).toBe(`tel:${oshawa.phone!.replace(/\D/g, "")}`)
  })

  it("adds one Directions button when a clinic's address is named", () => {
    const { actions } = extractChatActions(
      `Our clinic is at ${oshawa.address}. Directions: ${getGoogleMapsDirectionsUrl(oshawa)}`,
    )
    expect(actions.filter(a => a.kind === "directions")).toHaveLength(1)
    const { actions: addressOnly } = extractChatActions(`We're at ${oshawa.address}, ${oshawa.city}.`)
    expect(addressOnly).toEqual([expect.objectContaining({ kind: "directions", label: `Directions to ${oshawa.shortName}` })])
  })

  it("keeps markdown link text and leaves plain replies untouched", () => {
    expect(extractChatActions("See [the form](/new-patient-form?clinic=oshawa).").text).toBe("See the form.")
    expect(extractChatActions("We are open 9 to 7.")).toEqual({ text: "We are open 9 to 7.", actions: [], chooseClinic: false })
  })

  it("hides the clinic-picker marker and reports it, even mid-stream", () => {
    expect(extractChatActions("Which town are you in?\n[[choose-clinic]]")).toEqual({ text: "Which town are you in?", actions: [], chooseClinic: true })
    expect(extractChatActions("Which town are you in?\n[[choose-cl").text).toBe("Which town are you in?")
  })
})
