import OpenAI from 'openai';
import { buildPrompt, type ProductKey } from './prompts';
import type { NumerologyProfile } from './numerologyServer';

let cached: OpenAI | null = null;

function getClient(): OpenAI {
  if (cached) return cached;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  cached = new OpenAI({ apiKey: key });
  return cached;
}

export interface GenerateReportResult {
  text: string;
  title: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export async function generateReport(
  product: ProductKey,
  profile: NumerologyProfile,
  language: string = 'en',
): Promise<GenerateReportResult> {
  const built = buildPrompt({ product, profile, language });
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: built.model,
    temperature: built.temperature,
    max_tokens: built.maxTokens,
    messages: [
      { role: 'system', content: built.system },
      { role: 'user', content: built.user },
    ],
  });

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned empty content');

  return {
    text,
    title: built.title,
    model: built.model,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
  };
}
