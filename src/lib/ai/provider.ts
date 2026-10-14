import { createGoogleGenerativeAI } from "@ai-sdk/google"

const gemini = createGoogleGenerativeAI({
  apiKey:
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const AI_MODEL = gemini(process.env.GEMINI_MODEL ?? "gemini-2.5-flash")
