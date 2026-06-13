/**
 * WireTex wireframe generator system prompt.
 *
 * Source of truth: lib/generator/prompts/wiretex-generator.txt
 * Regenerate: npm run sync-system-prompt
 *
 * @example
 * import {
 *   SYSTEM_PROMPT,
 *   buildWireTexGeneratorMessages,
 *   extractWireTexMarkup,
 * } from "@/lib/generator/system-prompt";
 *
 * const messages = buildWireTexGeneratorMessages("Checkout page with payment form");
 * const raw = await callYourModel(messages);
 * const markup = extractWireTexMarkup(raw);
 */

import { SYSTEM_PROMPT } from "./system-prompt.generated";

export { SYSTEM_PROMPT };

export const WIRETEX_GENERATOR_ERROR =
  "ERROR: This tool only generates WireTex wireframes." as const;

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** OpenAI / Ollama / Anthropic-style message list for a single generation request */
export function buildWireTexGeneratorMessages(
  userRequest: string,
): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userRequest.trim() },
  ];
}

/** Strip accidental markdown fences if the model wraps output anyway */
export function extractWireTexMarkup(modelOutput: string): string {
  const text = modelOutput.trim();

  if (text.startsWith("ERROR:")) {
    return text;
  }

  const fenced = text.match(
    /^```(?:wiretex|txt|text|markdown)?\s*\r?\n([\s\S]*?)\r?\n```$/i,
  );
  if (fenced) {
    return fenced[1].trim();
  }

  return text;
}
