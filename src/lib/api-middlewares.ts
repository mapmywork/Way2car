import { NextRequest } from "next/server";
import { apiError } from "./utils";
import { redis } from "./redis";
import { ZodError } from "zod";

/**
 * Handle common API errors (e.g. Zod validation errors, unexpected server errors)
 */
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Validation failed", "VALIDATION_ERROR", 400, error.flatten());
  }

  console.error("[API Error]", error);
  return apiError("Internal server error", "INTERNAL_ERROR", 500);
}

/**
 * Basic rate limiting using Upstash Redis.
 * Falls back to allowing requests if Redis is unavailable.
 */
export async function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowInSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!redis) {
    return { success: true, limit, remaining: limit, reset: Date.now() + windowInSeconds * 1000 };
  }

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimitKey = `ratelimit:${key}:${ip}`;

  try {
    const [response] = await redis.pipeline()
      .incr(rateLimitKey)
      .expire(rateLimitKey, windowInSeconds)
      .exec();

    const currentUsage = response as number;
    const remaining = Math.max(0, limit - currentUsage);

    return {
      success: currentUsage <= limit,
      limit,
      remaining,
      reset: Date.now() + windowInSeconds * 1000,
    };
  } catch (error) {
    console.warn("[Rate Limit] Error checking rate limit, bypassing:", error);
    return { success: true, limit, remaining: limit, reset: Date.now() + windowInSeconds * 1000 };
  }
}

/**
 * Common configuration for rate limits
 */
export const RATE_LIMITS = {
  PUBLIC_API: { limit: 100, window: 60 }, // 100 req per minute
  AUTH: { limit: 5, window: 60 },         // 5 req per minute for auth routes
  BOOKING: { limit: 10, window: 60 },     // 10 req per minute for booking creation
};
