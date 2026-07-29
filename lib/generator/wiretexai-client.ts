import type { ChatMessage } from "@/lib/generator/system-prompt";
import {
  GenerationServiceError,
  toGenerationServiceError,
  classifyHttpError,
} from "@/lib/generator/wiretexai-errors";

const WIRETEXAI_TIMEOUT_MS = 110_000; // 110 seconds, longer than backend's ~90s Ollama timeout
const RETRY_DELAY_MS = 1_000;

// Failure classes that fail fast (a connection-level error, or an immediate non-2xx
// from Cloudflare's edge) rather than after waiting out the full request timeout.
// Retrying these once absorbs the brief, silent gaps observed between the
// Cloudflare Tunnel and the origin container. Deliberately excludes "timeout"
// (the first attempt already waited the full budget - retrying would double the
// worst-case wait for no real benefit) and "upstream_auth"/"upstream_rate_limit"
// (retrying immediately won't change the outcome).
const RETRYABLE_CODES = new Set(["unreachable", "upstream_error"]);

export async function callWireTexAI(
  prompt: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const wiretexaiUrl = process.env.WIRETEXAI_URL;
  const apiKey = process.env.WIRETEXAI_API_KEY;

  if (!wiretexaiUrl || !apiKey) {
    throw new GenerationServiceError(
      "config",
      "Generation is temporarily unavailable.",
    );
  }

  // Shared across both attempts so the two log lines for a single logical
  // request (original + retry) can be grepped/correlated together, and their
  // timestamps lined up against Cloudflare's Security Events log and the
  // wiretexai/cloudflared container logs.
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    return await attemptGenerate(wiretexaiUrl, apiKey, prompt, history, requestId, 1);
  } catch (error) {
    const serviceError = toGenerationServiceError(error);

    if (!RETRYABLE_CODES.has(serviceError.code)) {
      throw serviceError;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    try {
      return await attemptGenerate(wiretexaiUrl, apiKey, prompt, history, requestId, 2);
    } catch (retryError) {
      throw toGenerationServiceError(retryError);
    }
  }
}

async function attemptGenerate(
  wiretexaiUrl: string,
  apiKey: string,
  prompt: string,
  history: ChatMessage[],
  requestId: string,
  attempt: number,
): Promise<string> {
  const startedAt = new Date();
  const startedMs = Date.now();

  console.log(
    `[wiretexai-client] ${requestId} attempt=${attempt} request`,
    {
      timestamp: startedAt.toISOString(),
      url: `${wiretexaiUrl}/v1/generate`,
      promptLen: prompt.trim().length,
      historyLen: history.length,
    },
  );
  // Filter history to only include user and assistant messages (belt-and-suspenders defense)
  const safeHistory = history.filter(
    (msg): msg is ChatMessage =>
      (msg.role === "user" || msg.role === "assistant") &&
      typeof msg.content === "string",
  );

  const requestBody = {
    prompt: prompt.trim(),
    history: safeHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  };

  const response = await fetch(`${wiretexaiUrl}/v1/generate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(WIRETEXAI_TIMEOUT_MS),
  });

  if (!response.ok) {
    // Read the raw text first so a non-JSON body (e.g. Cloudflare's own HTML
    // error page when the tunnel has no live connection) is still visible in
    // logs instead of collapsing to a silent null - that distinction is the
    // difference between "our Go server rejected this" and "the request never
    // reached our Go server at all".
    const rawBody = await response.text().catch(() => null);
    let parsedBody: unknown = null;
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = null;
      }
    }

    const httpErrorCode = classifyHttpError(response.status);
    const userMessage = getUserMessageForHttpError(httpErrorCode);

    console.error(
      `[wiretexai-client] ${requestId} attempt=${attempt} failed`,
      {
        durationMs: Date.now() - startedMs,
        httpStatus: response.status,
        errorCode: httpErrorCode,
      },
    );

    throw new GenerationServiceError(httpErrorCode, userMessage, {
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: parsedBody,
      rawBody: rawBody ? rawBody.slice(0, 2000) : null,
    });
  }

  const data = (await response.json()) as { markup?: string };
  const markup = (data.markup ?? "").trim();

  if (!markup) {
    console.error(
      `[wiretexai-client] ${requestId} attempt=${attempt} failed`,
      {
        durationMs: Date.now() - startedMs,
        httpStatus: response.status,
        errorCode: "empty_response",
      },
    );

    throw new GenerationServiceError(
      "empty_response",
      "The model returned an empty response. Please try again.",
    );
  }

  console.log(
    `[wiretexai-client] ${requestId} attempt=${attempt} succeeded`,
    {
      durationMs: Date.now() - startedMs,
      markupLen: markup.length,
    },
  );

  return markup;
}

/**
 * Maps HTTP error classification codes to user-facing messages.
 * @internal
 */
function getUserMessageForHttpError(code: string): string {
  switch (code) {
    case "upstream_auth":
      return "Generation is temporarily unavailable.";
    case "upstream_rate_limit":
      return "Too many requests right now. Please try again shortly.";
    case "model_loading":
      return "The generator is waking up or offline. Wait a minute and try again.";
    case "timeout":
      return "Generation timed out. Please try again.";
    case "upstream_error":
    default:
      return "Something went wrong while generating. Please try again.";
  }
}
