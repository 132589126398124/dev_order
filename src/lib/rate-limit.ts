import { RateLimiterMemory } from "rate-limiter-flexible";

// Upstash Redis rate limiter — loaded only when env vars are present
let upstashOrderLimiter: any = null;
let upstashLoginLimiter: any = null;

async function getUpstashLimiters() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (upstashOrderLimiter) return { order: upstashOrderLimiter, login: upstashLoginLimiter };

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  upstashOrderLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "rl:order",
  });

  upstashLoginLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    prefix: "rl:login",
  });

  return { order: upstashOrderLimiter, login: upstashLoginLimiter };
}

// In-memory fallback for local dev (ineffective on serverless — warning expected)
const memOrderLimiter = new RateLimiterMemory({ points: 5, duration: 3600 });
const memLoginLimiter = new RateLimiterMemory({ points: 10, duration: 900 });

export async function checkOrderRateLimit(ip: string): Promise<boolean> {
  const upstash = await getUpstashLimiters();
  if (upstash) {
    const { success } = await upstash.order.limit(ip);
    return success;
  }
  try {
    await memOrderLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  const upstash = await getUpstashLimiters();
  if (upstash) {
    const { success } = await upstash.login.limit(ip);
    return success;
  }
  try {
    await memLoginLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}
