import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const RATE_LIMIT_COOKIE = "wiretex_gen_session";
export const RATE_LIMIT_MAX_REQUESTS = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export interface SessionState {
  id: string;
  requests: number[];
}

function getSecret(): string {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (secret) {
    return secret;
  }

 
  throw new Error("RATE_LIMIT_SECRET is required in production");
 
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSession(): SessionState {
  return { id: randomUUID(), requests: [] };
}

export function parseSession(value: string | undefined): SessionState {
  if (!value) {
    return createSession();
  }

  const dot = value.lastIndexOf(".");
  if (dot === -1) {
    return createSession();
  }

  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  const expected = sign(payload);

  try {
    const valid =
      signature.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) {
      return createSession();
    }
  } catch {
    return createSession();
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { id?: unknown; requests?: unknown };

    if (typeof parsed.id !== "string" || !Array.isArray(parsed.requests)) {
      return createSession();
    }

    return {
      id: parsed.id,
      requests: parsed.requests.filter(
        (timestamp): timestamp is number => typeof timestamp === "number",
      ),
    };
  } catch {
    return createSession();
  }
}

export function serializeSession(session: SessionState): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function pruneRequests(
  requests: number[],
  now = Date.now(),
): number[] {
  return requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
}

export function getRateLimitInfo(
  session: SessionState,
  now = Date.now(),
): {
  remaining: number;
  resetAt: number | null;
  session: SessionState;
} {
  const requests = pruneRequests(session.requests, now);
  const prunedSession = { ...session, requests };

  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = Math.min(...requests);
    return {
      remaining: 0,
      resetAt: oldest + RATE_LIMIT_WINDOW_MS,
      session: prunedSession,
    };
  }

  return {
    remaining: RATE_LIMIT_MAX_REQUESTS - requests.length,
    resetAt: null,
    session: prunedSession,
  };
}

export function consumeRateLimit(session: SessionState, now = Date.now()): {
  allowed: boolean;
  remaining: number;
  resetAt: number | null;
  session: SessionState;
} {
  const info = getRateLimitInfo(session, now);
  if (info.remaining <= 0) {
    return { allowed: false, ...info };
  }

  return {
    allowed: true,
    remaining: info.remaining - 1,
    resetAt: null,
    session: {
      ...info.session,
      requests: [...info.session.requests, now],
    },
  };
}
