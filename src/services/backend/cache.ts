import { type AxiosRequestConfig } from "@/lib/vendors";

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

// Cache configuration
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheStore = new Map<string, CacheEntry<any>>();

// Cache options interface
export interface CacheOptions {
  duration?: number;
  enabled?: boolean;
  key?: string;
}

// Cache helper functions
export function getCacheKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config;
  const key = {
    method: method?.toLowerCase(),
    url,
    params,
    data: method?.toLowerCase() === 'get' ? data : undefined,
  };
  return JSON.stringify(key);
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

// Cache wrapper for API requests
export async function withCache<T>(
  config: AxiosRequestConfig,
  makeRequest: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { duration = DEFAULT_CACHE_DURATION, enabled = true } = options;
  
  // Only cache GET requests
  if (!enabled || config.method?.toLowerCase() !== 'get') {
    return makeRequest();
  }

  const cacheKey = options.key || getCacheKey(config);
  const cachedData = getCache<T>(cacheKey);

  if (cachedData !== null) {
    console.debug('Cache hit:', cacheKey);
    return cachedData;
  }

  console.debug('Cache miss:', cacheKey);
  const response = await makeRequest();
  setCache(cacheKey, response, duration);
  return response;
}
