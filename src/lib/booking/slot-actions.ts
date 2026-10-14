export type StaffSlotStatus = "open" | "held" | "booked" | "blocked"

export interface StaffSlot {
  id: string
  startAt: string
  status: StaffSlotStatus
  patientName: string | null
}

export type SlotDraftStatus = "open" | "blocked"
export type SlotDrafts = Record<string, SlotDraftStatus>

export function isSlotManageable(slot: Pick<StaffSlot, "status">) {
  return slot.status === "open" || slot.status === "blocked"
}

export function getSlotDisplayStatus(
  slot: Pick<StaffSlot, "id" | "status">,
  drafts: SlotDrafts
): StaffSlotStatus {
  return drafts[slot.id] ?? slot.status
}

export function stageSlotToggle(drafts: SlotDrafts, slot: StaffSlot): SlotDrafts {
  if (!isSlotManageable(slot)) return drafts

  const current = getSlotDisplayStatus(slot, drafts)
  const next = current === "open" ? "blocked" : "open"
  const nextDrafts = { ...drafts }

  if (next === slot.status) {
    delete nextDrafts[slot.id]
  } else {
    nextDrafts[slot.id] = next
  }

  return nextDrafts
}

export function buildSlotPatchRequests(slots: StaffSlot[], drafts: SlotDrafts) {
  const block: string[] = []
  const unblock: string[] = []

  for (const slot of slots) {
    const draft = drafts[slot.id]
    if (!draft || draft === slot.status) continue
    if (slot.status === "open" && draft === "blocked") block.push(slot.id)
    if (slot.status === "blocked" && draft === "open") unblock.push(slot.id)
  }

  return { block, unblock }
}
