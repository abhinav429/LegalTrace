import { createOpenAI } from '@ai-sdk/openai';

/**
 * OpenAI-compatible API (direct OpenAI, AICredits, or any proxy).
 * Set OPENAI_BASE_URL for providers other than api.openai.com (e.g. https://api.aicredits.in/v1).
 */
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL:
    process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
});
