import { z } from "zod";
import { CLINIC_LOCATIONS } from "@/config/clinic";
export const chatSchema = z.object({
  clinic: z.string().optional().refine(v => !v || CLINIC_LOCATIONS.some(l => l.slug === v)),
  messages: z.array(z.object({
    id: z.string().min(1).max(100),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.union([z.object({ type: z.literal("text"), text: z.string().min(1).max(1500) }), z.object({ type: z.literal("step-start") })])).min(1).max(8).transform(parts => parts.filter((part): part is { type: "text"; text: string } => part.type === "text")).refine(parts => parts.length > 0),
  })).min(1).max(16).refine(messages => messages[messages.length-1].role === "user"),
});
