import { describe, expect, it } from "vitest"

import {
  buildSlotPatchRequests,
  stageSlotToggle,
  type StaffSlot,
  type SlotDrafts,
} from "./slot-actions"

const slots: StaffSlot[] = [
  {
    id: "open-1",
    startAt: "2026-06-18T13:00:00.000Z",
    status: "open",
    patientName: null,
  },
  {
    id: "blocked-1",
    startAt: "2026-06-18T13:20:00.000Z",
    status: "blocked",
    patientName: null,
  },
  {
    id: "booked-1",
    startAt: "2026-06-18T13:40:00.000Z",
    status: "booked",
    patientName: "Jordan Lee",
  },
]

describe("slot action staging", () => {
  it("stages an open slot to block and cancels when clicked again", () => {
    const first = stageSlotToggle({}, slots[0])
    expect(first).toEqual({ "open-1": "blocked" })

    const second = stageSlotToggle(first, slots[0])
    expect(second).toEqual({})
  })

  it("stages a blocked slot to reopen and cancels when clicked again", () => {
    const first = stageSlotToggle({}, slots[1])
    expect(first).toEqual({ "blocked-1": "open" })

    const second = stageSlotToggle(first, slots[1])
    expect(second).toEqual({})
  })

  it("ignores booked and held slots", () => {
    expect(stageSlotToggle({}, slots[2])).toEqual({})
  })

  it("builds separate block and unblock requests for save", () => {
    const drafts: SlotDrafts = {
      "open-1": "blocked",
      "blocked-1": "open",
    }

    expect(buildSlotPatchRequests(slots, drafts)).toEqual({
      block: ["open-1"],
      unblock: ["blocked-1"],
    })
  })
})
