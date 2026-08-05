/**
 * Lightweight in-process TTL cache for Next.js API routes.
 *
 * Why not Redis? For a platform of this scale a single-process Map is
 * sufficient and adds zero infrastructure cost or latency overhead.
 * Swap to Redis/Upstash later if you scale to multiple Vercel regions.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value. Returns `undefined` if the key is missing or expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Store a value with a TTL (in seconds).
 */
export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/**
 * Invalidate one or more cache keys by prefix.
 * e.g. invalidatePrefix("notifications:") clears all per-user notification caches.
 */
export function invalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Delete a single cache key immediately (e.g. after a mutation).
 */
export function cacheDelete(key: string): void {
  store.delete(key);
}
