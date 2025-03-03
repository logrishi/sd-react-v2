import { QueryClient } from "@tanstack/react-query";
import { isRetryableError, logError } from "@/lib/utils/error";
import { transformError } from "@/services/backend/react-query-wrapper";

// Query Client Configuration
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      networkMode: "online" as const,
      suspense: true, // Enable suspense by default
      retry: (failureCount: number, error: any) => {
        if (!isRetryableError(error)) return false;
        return failureCount < errorConfig.maxRetries;
      },
      retryDelay: (attemptIndex: any) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
      onError: (error: any) => {
        logError(error);
      },
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      throwOnError: true,
      useErrorBoundary: true, // Use error boundaries for error handling
      structuralSharing: true, // Enable structural sharing
      keepPreviousData: true, // Keep previous data while fetching
      cacheTime: 30 * 60 * 1000, // 30 minutes cache time
    },
    mutations: {
      networkMode: "online" as const,
      retry: (failureCount: number, error: any) => {
        const transformedError = transformError(error);
        if (transformedError.type === "validation") return false;
        return failureCount < 3;
      },
    },
  },
};

// Cache Configuration
export const cacheConfig = {
  type: "localStorage" as const,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  prefix: "frontql_cache_",
};

// Query Key Configuration
export const queryKeyConfig = {
  prefix: "frontql" as const,
  separator: "." as const,
};

// Error Configuration
export const errorConfig = {
  retryableStatusCodes: [408, 500, 502, 503, 504],
  maxRetries: 3,
  retryDelay: 1000,
};


