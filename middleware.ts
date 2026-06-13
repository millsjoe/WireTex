import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const IP_RATE_LIMIT_MAX = 20;
export const IP_RATE_LIMIT_WINDOW = "1 h";

function getIpRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(IP_RATE_LIMIT_MAX, IP_RATE_LIMIT_WINDOW),
    prefix: "wiretex:chat:ip",
    analytics: true,
  });
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function middleware(request: NextRequest) {
  const ratelimit = getIpRateLimiter();

  if (!ratelimit) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 },
      );
    }

    return NextResponse.next();
  }

  const ip = getClientIp(request);
  const { success, reset } = await ratelimit.limit(ip);

  if (!success) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((reset - Date.now()) / 1000),
    );

    return NextResponse.json(
      {
        error: "Too many requests from your network. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat", "/chat/:path*"],
};
