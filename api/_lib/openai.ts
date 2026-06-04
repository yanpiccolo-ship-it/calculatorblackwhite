// Report generation via Google Gemini (free tier: gemini-1.5-flash)
// Falls back to OpenAI if GEMINI_API_KEY is not set and OPENAI_API_KEY is.

import { buildPrompt, type ProductKey } from './prompts';
import type { NumerologyProfile } from './numerologyServer';

export interface GenerateReportResult {
  text: string;
  title: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

// ── Gemini ────────────────────────────────────────────────────────────────
async function generateWithGemini(
  system: string,
  user: string,
  temperature: number,
  maxTokens: number,
  title: string,
): Promise<GenerateReportResult> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: system,
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const text = result.response.text()?.trim();
  if (!text) throw new Error('Gemini returned empty content');

  const usage = result.response.usageMetadata;
  return {
    text,
    title,
    model: 'gemini-1.5-flash',
    promptTokens: usage?.promptTokenCount,
    completionTokens: usage?.candidatesTokenCount,
  };
}

// ── OpenAI fallback ───────────────────────────────────────────────────────
async function generateWithOpenAI(
  system: string,
  user: string,
  model: string,
  temperature: number,
  maxTokens: number,
  title: string,
): Promise<GenerateReportResult> {
  const OpenAI = (await import('openai')).default;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');

  const openai = new OpenAI({ apiKey: key });
  const response = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned empty content');

  return {
    text,
    title,
    model,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
  };
}

// ── Public API ────────────────────────────────────────────────────────────
export async function generateReport(
  product: ProductKey,
  profile: NumerologyProfile,
  language: string = 'en',
): Promise<GenerateReportResult> {
  const built = buildPrompt({ product, profile, language });

  // Prefer Gemini (free), fall back to OpenAI
  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(
      built.system,
      built.user,
      built.temperature,
      built.maxTokens,
      built.title,
    );
  }

  return generateWithOpenAI(
    built.system,
    built.user,
    built.model,
    built.temperature,
    built.maxTokens,
    built.title,
  );
}
