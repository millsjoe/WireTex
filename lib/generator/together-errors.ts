import { APIError } from "together-ai";

export class GenerationServiceError extends Error {
  readonly code: string;
  readonly causeDetail?: unknown;

  constructor(code: string, userMessage: string, causeDetail?: unknown) {
    super(userMessage);
    this.name = "GenerationServiceError";
    this.code = code;
    this.causeDetail = causeDetail;
  }
}

function extractTogetherErrorCode(error: APIError): string | undefined {
  const body = error.error as Record<string, unknown> | undefined;
  if (!body) {
    return undefined;
  }

  const nested = body.error;
  if (nested && typeof nested === "object") {
    const code = (nested as Record<string, unknown>).code;
    if (typeof code === "string") {
      return code;
    }
  }

  const topLevelCode = body.code;
  if (typeof topLevelCode === "string") {
    return topLevelCode;
  }

  return undefined;
}

export function toGenerationServiceError(error: unknown): GenerationServiceError {
  if (error instanceof GenerationServiceError) {
    return error;
  }

  if (error instanceof APIError) {
    const apiCode = extractTogetherErrorCode(error);

    if (apiCode === "dedicated_endpoint_not_running") {
      return new GenerationServiceError(
        "endpoint_offline",
        "The generator is waking up or offline. Wait a minute and try again.",
        error,
      );
    }

    if (error.status === 429 || apiCode === "rate_limit_exceeded") {
      return new GenerationServiceError(
        "upstream_rate_limit",
        "Too many requests right now. Please try again shortly.",
        error,
      );
    }

    if (error.status === 401 || error.status === 403) {
      return new GenerationServiceError(
        "upstream_auth",
        "Generation is temporarily unavailable.",
        error,
      );
    }

    return new GenerationServiceError(
      "upstream_error",
      "Something went wrong while generating. Please try again.",
      error,
    );
  }

  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return new GenerationServiceError(
        "timeout",
        "Generation timed out. Please try again.",
        error,
      );
    }

    if (error.message.includes("not configured")) {
      return new GenerationServiceError(
        "config",
        "Generation is temporarily unavailable.",
        error,
      );
    }

    if (error.message.includes("empty response")) {
      return new GenerationServiceError(
        "empty_response",
        "The model returned an empty response. Please try again.",
        error,
      );
    }
  }

  return new GenerationServiceError(
    "unknown",
    "Something went wrong while generating. Please try again.",
    error,
  );
}

export function logGenerationServiceError(
  context: string,
  error: GenerationServiceError,
): void {
  console.error(`[${context}] ${error.code}: ${error.message}`, error.causeDetail);
}
