/**
 * Upstash Redis client (HTTP-based).
 *
 * Used for:
 *  - Idempotency lock:  SET pay-lock:{bookingId} 1 NX PX 30000
 *  - Daraja token cache: SET daraja-token:{key} {token} EX 3300
 *  - QStash reconciliation retry counter: INCR reconcile-tries:{paymentId}
 *
 * The HTTP transport works inside Vercel serverless functions and Edge runtimes.
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from "@upstash/redis";

function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis env vars: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required."
    );
  }

  return new Redis({ url, token });
}

// Lazy singleton — instantiated on first import, not at module parse time,
// so unit tests can set env vars before importing.
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) _redis = createRedisClient();
  return _redis;
}

// ── Convenience helpers ─────────────────────────────────────────────────────

/**
 * Acquire a SETNX lock. Returns `true` if the lock was acquired.
 * TTL is in milliseconds.
 */
export async function acquireLock(key: string, ttlMs = 30_000): Promise<boolean> {
  const result = await getRedis().set(key, "1", { nx: true, px: ttlMs });
  return result === "OK";
}

/** Release a lock immediately. */
export async function releaseLock(key: string): Promise<void> {
  await getRedis().del(key);
}

/**
 * Get a cached string value. Returns `null` if the key is absent or expired.
 */
export async function redisGet(key: string): Promise<string | null> {
  return getRedis().get<string>(key);
}

/**
 * Store a string value with a TTL (seconds).
 */
export async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  await getRedis().set(key, value, { ex: ttlSeconds });
}

/**
 * Increment a counter and return the new value.
 * Used for reconciliation retry counting.
 */
export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  const count = await getRedis().incr(key);
  if (ttlSeconds && count === 1) {
    // Set expiry only on first increment to avoid resetting the TTL
    await getRedis().expire(key, ttlSeconds);
  }
  return count;
}
