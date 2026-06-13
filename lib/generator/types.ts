export type GenerateWireframeErrorCode =
  | "rate_limit"
  | "validation"
  | "config"
  | "api"
  | "captcha";

export type GenerateWireframeResult =
  | {
      ok: true;
      markup: string;
      raw: string;
      remaining: number;
      resetAt: number | null;
      isGeneratorError: boolean;
    }
  | {
      ok: false;
      code: GenerateWireframeErrorCode;
      message: string;
      remaining?: number;
      resetAt?: number | null;
    };

export type RateLimitStatus = {
  remaining: number;
  resetAt: number | null;
  maxRequests: number;
  windowMs: number;
};
