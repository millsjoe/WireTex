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

export function toGenerationServiceError(error: unknown): GenerationServiceError {
  if (error instanceof GenerationServiceError) {
    return error;
  }

  if (error instanceof DOMException || error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return new GenerationServiceError(
        "timeout",
        "Generation timed out. Please try again.",
        error,
      );
    }

    if (error instanceof TypeError) {
      // Network errors from fetch() in Node/Next.js (connection refused, DNS failure, tunnel down)
      return new GenerationServiceError(
        "unreachable",
        "The generator is temporarily unavailable. Please try again shortly.",
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

/**
 * Classifies HTTP error responses from WireTexAI backend.
 * @internal
 */
export function classifyHttpError(status: number): string {
  switch (status) {
    case 401:
    case 403:
      return "upstream_auth";
    case 429:
      return "upstream_rate_limit";
    case 503:
      return "model_loading";
    case 504:
      return "timeout";
    default:
      return "upstream_error";
  }
}

export function logGenerationServiceError(
  context: string,
  error: GenerationServiceError,
): void {
  console.error(`[${context}] ${error.code}: ${error.message}`, error.causeDetail);
}
