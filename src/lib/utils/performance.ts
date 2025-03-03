import { queryClient } from '@/services/backend/react-query-wrapper';
import type { QueryKey } from '@tanstack/react-query';

/**
 * Deduplicates queries by canceling in-flight requests for the same query key
 */
export function deduplicateQuery(queryKey: QueryKey): void {
  queryClient.cancelQueries({ queryKey });
}

/**
 * Updates specific fields in the cache without invalidating the entire query
 */
export function updateCacheFields<T extends Record<string, any>>(
  queryKey: QueryKey,
  updates: Partial<T>
): void {
  queryClient.setQueryData<T>(queryKey, (old) => {
    if (!old) return old;
    return { ...old, ...updates };
  });
}

/**
 * Background updates the cache while keeping the UI responsive
 */
export function backgroundUpdate<T>(
  queryKey: QueryKey,
  updateFn: (data: T) => Promise<T>
): void {
  queryClient.setQueryData<T>(queryKey, (old) => {
    if (!old) return old;
    // Schedule the update in the background
    Promise.resolve()
      .then(() => updateFn(old))
      .then((newData) => {
        queryClient.setQueryData<T>(queryKey, newData);
      })
      .catch((error) => {
        console.error('Background update failed:', error);
        // Revert to old data on error
        queryClient.setQueryData<T>(queryKey, old);
      });
    return old;
  });
}
