import { Redis } from "@upstash/redis";

// ─── Redis Client (Upstash) ─────────────────────────────────────
// Used for caching availability lookups and search results.

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Caching disabled."
    );
    return null;
  }

  return new Redis({ url, token });
}

export const redis = createRedisClient();

// ─── Cache Helpers ───────────────────────────────────────────────

const CACHE_TTL = {
  AVAILABILITY: 300, // 5 minutes
  SEARCH: 120, // 2 minutes
  VEHICLE: 600, // 10 minutes
} as const;

/**
 * Get a cached value, or compute and cache it.
 * Falls back to direct computation if Redis is unavailable.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  if (!redis) return compute();

  try {
    const cachedValue = await redis.get<T>(key);
    if (cachedValue !== null && cachedValue !== undefined) {
      return cachedValue;
    }
  } catch (error) {
    console.error("[Redis] Cache read error:", error);
    // Fall through to compute
  }

  const value = await compute();

  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    console.error("[Redis] Cache write error:", error);
  }

  return value;
}

/**
 * Invalidate cache keys matching a pattern prefix.
 */
export async function invalidateCache(prefix: string): Promise<void> {
  if (!redis) return;

  try {
    // Upstash doesn't support SCAN, so we use known key patterns
    // For production, maintain a set of keys per prefix
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("[Redis] Cache invalidation error:", error);
  }
}

export { CACHE_TTL };
