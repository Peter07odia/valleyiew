import type { MouseEvent } from "react"

/**
 * Clinic cards in the pickers can be clicked anywhere to choose that clinic.
 * Clicks on the card's own links and buttons (phone, directions, booking,
 * "Choose this clinic") keep doing their own job, so they're ignored here.
 * Keyboard users choose with the card's button.
 */
export function chooseOnCardClick(event: MouseEvent<HTMLElement>, choose: () => void) {
  if ((event.target as HTMLElement).closest("a, button")) return
  choose()
}

/** Shared hover look: the card under the mouse lifts and gets a strong blue outline. */
export const CLINIC_CARD_HOVER =
  "cursor-pointer transition-all duration-200 hover:z-10 hover:-translate-y-1 hover:shadow-[0_22px_45px_-22px_rgba(11,42,91,0.55)] hover:ring-2 hover:ring-primary"
