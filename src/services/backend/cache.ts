// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

// Cache configuration
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheStore = new Map<string, CacheEntry<any>>();

// Cache helper functions
export function getCacheKey(method: string, endpoint: string, options: unknown): string {
  return `${method}:${endpoint}:${JSON.stringify(options)}`;
}

export function setCache<T>(key: string, data: T, duration: number = DEFAULT_CACHE_DURATION): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    expiresIn: duration,
  });
}

export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
  if (isExpired) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
}

export function clearCache(pattern?: string): void {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of cacheStore.keys()) {
      if (regex.test(key)) {
        cacheStore.delete(key);
      }
    }
  } else {
    cacheStore.clear();
  }
}
