import { createHmac } from "node:crypto";
import { streamText, convertToModelMessages } from "ai";
import { AI_MODEL } from "@/lib/ai/provider";
import { clinicSystemPrompt } from "@/lib/ai/system-prompt";
import { chatSchema } from "@/lib/ai/chat-schema";
import { getRegistrationClient } from "@/lib/registration/server";
import { allowedOrigin, readBoundedJson, trustedClientIp } from "@/lib/http/request";
export const runtime = "nodejs";
export const maxDuration = 30;
const failure = (message: string, status: number) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (!allowedOrigin(request, true)) return failure("Please open chat from the clinic website.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return failure("Invalid message.", 415);
  let input: unknown;
  try { input = await readBoundedJson(request, 24000); } catch { return failure("Please send a shorter message.", 400); }
  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) return failure("Please start a new conversation or send a shorter message.", 400);
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) return failure("Chat is temporarily unavailable. Please call your clinic.", 503);
  try {
    const key = process.env.VVM_CHAT_RATE_LIMIT_SECRET;
    if (!key) return failure("Chat is temporarily unavailable. Please call your clinic.", 503);
    const fingerprint = createHmac("sha256", key).update(trustedClientIp(request)).digest("hex");
    const { data, error } = await getRegistrationClient().rpc("claim_valleyview_chat_request", { client_fingerprint: fingerprint });
    if (error) return failure("Chat is temporarily unavailable. Please call your clinic.", 503);
    if (!data) return failure("You have reached the chat limit. Please call your clinic or try again later.", 429);
    const result = streamText({ model: AI_MODEL, system: clinicSystemPrompt(parsed.data.clinic), messages: await convertToModelMessages(parsed.data.messages), maxOutputTokens: 500, abortSignal: AbortSignal.timeout(25000), maxRetries: 1 });
    return result.toUIMessageStreamResponse({ headers: { "Cache-Control": "no-store" }, onError: () => "Chat is temporarily unavailable. Please call your clinic." });
  } catch { return failure("Chat is temporarily unavailable. Please call your clinic.", 503); }
}
