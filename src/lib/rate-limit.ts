import { RateLimiterMemory } from "rate-limiter-flexible";

const orderLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
});

const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 900,
});

export async function checkOrderRateLimit(ip: string): Promise<boolean> {
  try {
    await orderLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  try {
    await loginLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}
