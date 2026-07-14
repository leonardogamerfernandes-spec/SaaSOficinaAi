import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiKey = process.env.GEMINI_API_KEY;

let geminiClient: GoogleGenerativeAI | null = null;

if (geminiKey) {
  try {
    geminiClient = new GoogleGenerativeAI(geminiKey);
  } catch (err) {
    console.error("[OficinaAI] Failed to initialize Gemini API Client:", err);
  }
}

export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  if (!geminiClient) return null;
  return geminiClient.getGenerativeModel({ model: modelName });
}

export { geminiClient };
