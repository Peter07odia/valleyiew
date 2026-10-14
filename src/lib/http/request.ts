export function allowedOrigin(request: Request, required = false): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return !required;
  const allowed = new Set(["https://valleyviewmedical.ca", "https://www.valleyviewmedical.ca"]);
  // Explicit deploy configuration only; never trust caller-controlled Host headers.
  if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== "production") allowed.add(new URL(request.url).origin);
  return allowed.has(origin);
}
export function trustedClientIp(request: Request) {
  if (process.env.VERCEL === "1") return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return "local-preview";
}
export async function readBoundedJson(request: Request, limit: number): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Invalid body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) { await reader.cancel(); throw new Error("Body too large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
