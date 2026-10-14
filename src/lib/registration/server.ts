import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Registration } from "./schema";

function encryptionKey() {
  const key = Buffer.from(process.env.VVM_REGISTRATION_ENC_KEY ?? "", "base64");
  if (key.length !== 32) throw new Error("Registration encryption is not configured");
  return key;
}

export function decryptRegistrationHealthCard(value: string, legacy = false): string {
  if (!/^\\x(?:[\da-f]{2}){36,40}$/i.test(value)) throw new Error("Invalid encrypted health card");
  const bytes = Buffer.from(value.slice(2), "hex");
  const legacyKey = legacy ? Buffer.from(process.env.BRANTFORD_REGISTRATION_ENC_KEY ?? "", "base64") : encryptionKey();
  if (legacyKey.length !== 32) throw new Error("Legacy encryption is not configured");
  const decipher = createDecipheriv("aes-256-gcm", legacyKey, bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  const plain = Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
  if (!/^[A-Z0-9]{8,12}$/.test(plain)) throw new Error("Invalid health card");
  return plain;
}

export function getRegistrationClient() {
  const url = process.env.VVM_REGISTRATION_SUPABASE_URL;
  const key = process.env.VVM_REGISTRATION_SERVICE_ROLE_KEY;
  // Dedicated credentials keep disabled legacy booking and staff paths disconnected.
  if (url !== "https://mdstlgpuzstyknmyfovc.supabase.co" || !key) {
    throw new Error("Registration database is not configured");
  }
  encryptionKey();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function registrationRecord(data: Registration, trustedIp: string) {
  const key = encryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(data.ohipNumber + data.ohipVersionCode, "utf8"), cipher.final()]);
  const hash = (value: string) => createHmac("sha256", key).update(value).digest("hex");
  // Keep retries from the original Ontario-only form idempotent after deployment.
  const legacyPayload = { ...data } as Partial<Registration>;
  if (data.healthCardProvince === "ON" && !data.ohipVersionCode) {
    delete legacyPayload.healthCardProvince;
    delete legacyPayload.ohipVersionCode;
  }
  return {
    id: data.submissionId,
    first_name: data.firstName, last_name: data.lastName,
    email: data.email, phone: data.phone, date_of_birth: data.dateOfBirth,
    gender: data.gender, address: data.address, city: data.city, postal_code: data.postalCode,
    preferred_location: data.preferredLocation,
    health_card_province: data.healthCardProvince,
    ohip_encrypted: "\\x" + Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("hex"),
    conditions: data.conditions, medications: data.medications, comments: data.comments,
    consent_version: "2026-10-14",
    payload_hash: hash(JSON.stringify(legacyPayload)),
    request_fingerprint: hash(trustedIp),
  };
}
