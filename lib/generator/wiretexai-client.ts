import type { ChatMessage } from "@/lib/generator/system-prompt";
import {
  GenerationServiceError,
  toGenerationServiceError,
  classifyHttpError,
} from "@/lib/generator/wiretexai-errors";

const WIRETEXAI_TIMEOUT_MS = 110_000; // 110 seconds, longer than backend's ~90s Ollama timeout

export async function callWireTexAI(
  prompt: string,
  history: ChatMessage[] = [],
): Promise<string> {
  try {
    const wiretexaiUrl = process.env.WIRETEXAI_URL;
    const apiKey = process.env.WIRETEXAI_API_KEY;

    if (!wiretexaiUrl || !apiKey) {
      throw new GenerationServiceError(
        "config",
        "Generation is temporarily unavailable.",
      );
    }

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
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }

      const httpErrorCode = classifyHttpError(response.status);
      const userMessage = getUserMessageForHttpError(httpErrorCode);
      throw new GenerationServiceError(httpErrorCode, userMessage, {
        status: response.status,
        body: errorBody,
      });
    }

    const data = (await response.json()) as { markup?: string };
    const markup = (data.markup ?? "").trim();

    if (!markup) {
      throw new GenerationServiceError(
        "empty_response",
        "The model returned an empty response. Please try again.",
      );
    }

    return markup;
  } catch (error) {
    throw toGenerationServiceError(error);
  }
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
