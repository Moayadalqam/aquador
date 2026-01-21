import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Check if Upstash is configured
const isConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client (only if configured)
const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate limiters for different endpoints
export const rateLimiters = {
  // Checkout: 5 requests per minute
  checkout: isConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:checkout',
      })
    : null,

  // Contact form: 3 requests per minute
  contact: isConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 m'),
        analytics: true,
        prefix: 'ratelimit:contact',
      })
    : null,

  // Payment: 5 requests per minute
  payment: isConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:payment',
      })
    : null,
};

export type RateLimiterKey = keyof typeof rateLimiters;

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return '127.0.0.1';
}

/**
 * Check rate limit for a request
 * Returns null if within limit, or a NextResponse if rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  limiterKey: RateLimiterKey
): Promise<NextResponse | null> {
  const limiter = rateLimiters[limiterKey];

  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return null;
  }

  const ip = getClientIp(request);
  const { success, limit, reset, remaining } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
