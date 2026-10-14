import "server-only"
import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

function key(): Buffer {
  const k = process.env.HEALTH_CARD_ENC_KEY
  if (!k) throw new Error("HEALTH_CARD_ENC_KEY not set")
  const buf = Buffer.from(k, "base64")
  if (buf.length !== 32) throw new Error("HEALTH_CARD_ENC_KEY must be 32 bytes (base64)")
  return buf
}

// layout: [12-byte iv][16-byte authTag][ciphertext]
export function encryptHealthCard(plain: string): Buffer {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key(), iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), ct])
}

export function decryptHealthCard(blob: Buffer): string {
  const iv = blob.subarray(0, 12)
  const tag = blob.subarray(12, 28)
  const ct = blob.subarray(28)
  const decipher = createDecipheriv("aes-256-gcm", key(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
}
