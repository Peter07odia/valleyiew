import { describe, it, expect, beforeAll } from "vitest"
import { encryptHealthCard, decryptHealthCard } from "./crypto"

beforeAll(() => {
  // 32 random bytes, base64 — deterministic for the test run.
  process.env.HEALTH_CARD_ENC_KEY = Buffer.alloc(32, 7).toString("base64")
})

describe("health card crypto", () => {
  it("round-trips a value", () => {
    const enc = encryptHealthCard("1234-567-890")
    expect(enc).toBeInstanceOf(Buffer)
    expect(decryptHealthCard(enc)).toBe("1234-567-890")
  })
  it("produces different ciphertext each time (random IV)", () => {
    expect(encryptHealthCard("x").equals(encryptHealthCard("x"))).toBe(false)
  })
})
