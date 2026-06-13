"use server";

import { cookies } from "next/headers";
import type {
  GenerateWireframeResult,
  RateLimitStatus,
} from "@/lib/generator/types";
import { sanitizeHistory } from "@/lib/generator/history-limit";
import { stripRemoteImageUrls } from "@/lib/generator/sanitize-markup";
import {
  extractWireTexMarkup,
  SYSTEM_PROMPT,
  type ChatMessage,
} from "@/lib/generator/system-prompt";
import { callTogetherChat } from "@/lib/generator/together";
import {
  logGenerationServiceError,
  toGenerationServiceError,
} from "@/lib/generator/together-errors";
import {
  consumeRateLimit,
  getRateLimitInfo,
  parseSession,
  RATE_LIMIT_COOKIE,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  serializeSession,
} from "@/lib/security/rate-limit";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/security/turnstile";

const MAX_PROMPT_LENGTH = 4000;
const MIN_PROMPT_LENGTH = 3;

async function persistSession(value: string): Promise<void> {
  const store = await cookies();
  store.set(RATE_LIMIT_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

function buildMessages(
  history: ChatMessage[],
  prompt: string,
): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: prompt },
  ];
}

function formatResetTime(resetAt: number): string {
  const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export async function getRateLimitStatus(): Promise<RateLimitStatus> {
  const store = await cookies();
  const session = parseSession(store.get(RATE_LIMIT_COOKIE)?.value);
  const { remaining, resetAt } = getRateLimitInfo(session);

  return {
    remaining,
    resetAt,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  };
}

export async function generateWireframe(
  prompt: string,
  history: ChatMessage[] = [],
  turnstileToken = "",
): Promise<GenerateWireframeResult> {
  const trimmed = prompt.trim();

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return {
      ok: false,
      code: "validation",
      message: "Describe the wireframe you want in at least a few words.",
    };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      ok: false,
      code: "validation",
      message: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`,
    };
  }

  if (isTurnstileConfigured()) {
    const captchaOk = await verifyTurnstileToken(turnstileToken);
    if (!captchaOk) {
      return {
        ok: false,
        code: "captcha",
        message: "Captcha verification failed. Please try again.",
      };
    }
  }

  const safeHistory = sanitizeHistory(history);

  const store = await cookies();
  const session = parseSession(store.get(RATE_LIMIT_COOKIE)?.value);
  const limit = consumeRateLimit(session);

  if (!limit.allowed) {
    const resetAt = limit.resetAt ?? Date.now() + RATE_LIMIT_WINDOW_MS;
    await persistSession(serializeSession(limit.session));

    return {
      ok: false,
      code: "rate_limit",
      message: `Rate limit reached. Try again in ${formatResetTime(resetAt)}.`,
      remaining: 0,
      resetAt,
    };
  }

  try {
    const raw = await callTogetherChat(buildMessages(safeHistory, trimmed));
    const markup = stripRemoteImageUrls(extractWireTexMarkup(raw));
    const isGeneratorError = markup.startsWith("ERROR:");

    await persistSession(serializeSession(limit.session));

    return {
      ok: true,
      markup,
      raw,
      remaining: limit.remaining,
      resetAt: null,
      isGeneratorError,
    };
  } catch (error) {
    const revertedSession = {
      ...limit.session,
      requests: limit.session.requests.slice(0, -1),
    };
    await persistSession(serializeSession(revertedSession));

    const serviceError = toGenerationServiceError(error);
    logGenerationServiceError("generateWireframe", serviceError);

    return {
      ok: false,
      code: serviceError.code === "config" ? "config" : "api",
      message: serviceError.message,
    };
  }
}
