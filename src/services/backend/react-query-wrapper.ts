import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueries,
  useInfiniteQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseInfiniteQueryOptions,
  type QueryKey,
  type InfiniteData,
  type QueryMeta,
  type MutationMeta,
  type DehydratedState,
} from "@tanstack/react-query";
import { hydrate } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import FrontQLApi, { type RequestOptions } from "./api-tanstack-query";
import { queryClientConfig, cacheConfig, queryKeyConfig, errorConfig } from "@/lib/config/query.config";

// Enhanced Error Types
type ApiError = {
  type: "api";
  error: AxiosError;
  message: string;
};

type ValidationError = {
  type: "validation";
  fields: Record<string, string[]>;
  message: string;
};

type NetworkError = {
  type: "network";
  message: string;
};

type QueryError = ApiError | ValidationError | NetworkError;

// Enhanced Types for FrontQL
type FrontQLOptions = {
  sort?: string;
  filter?: string;
  joins?: string;
  search?: string;
  nearby?: string;
  hidden?: boolean;
  fields?: string;
  session?: string;
  validation?: boolean;
  permissions?: string;
  page?: number;
  retries?: number;
  cursor?: string;
};

// Enhanced Query Configurations
type MutationContext<TData> = {
  previousData?: TData;
};

type QueryConfig<TData, TError = QueryError> = Omit<
  UseQueryOptions<TData, TError, TData, QueryKey>,
  "queryKey" | "queryFn"
> &
  FrontQLOptions & {
    prefetch?: boolean;
    placeholderData?: TData | (() => TData);
    suspense?: boolean;
  };

type MutationConfig<TData, TError = QueryError, TVariables = unknown> = Omit<
  UseMutationOptions<TData, TError, TVariables, MutationContext<TData>>,
  "mutationFn"
> & {
  optimistic?: boolean;
  invalidateQueries?: boolean;
};

type CursorPaginationInfo = {
  nextCursor?: string;
  prevCursor?: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type InfiniteQueryConfig<TData, TError = QueryError> = Omit<
  UseInfiniteQueryOptions<TData, TError>,
  "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
> &
  Omit<FrontQLOptions, "cursor"> & {
    pageSize?: number;
    initialCursor?: string | null;
  };

interface PaginatedResponse<T> extends CursorPaginationInfo {
  data: T[];
  total: number;
}

// Enhanced Query Keys with Prefixing
const createPrefixedKeys = (prefix: string) => ({
  all: (endpoint: string) => [prefix, endpoint] as const,
  list: (endpoint: string, options?: FrontQLOptions) =>
    [...createPrefixedKeys(prefix).all(endpoint), "list", options ? { ...options } : {}] as const,
  detail: (endpoint: string, id: string | number) =>
    [...createPrefixedKeys(prefix).all(endpoint), "detail", { id }] as const,
  infinite: (endpoint: string, options?: FrontQLOptions) =>
    [...createPrefixedKeys(prefix).all(endpoint), "infinite", options ? { ...options } : {}] as const,
});

export const queryKeys = createPrefixedKeys(queryKeyConfig.prefix);

// Enhanced Default Configurations
const defaultQueryMeta: QueryMeta = {
  retryDelay: errorConfig.retryDelay,
  persister: cacheConfig.type,
};

const defaultMutationMeta: MutationMeta = {
  retryDelay: errorConfig.retryDelay,
  optimistic: true,
};

// Enhanced Query Client with Better Error Handling
export const queryClient = new QueryClient(queryClientConfig);

// Enhanced API Wrapper
function useApi() {
  const queryClient = useQueryClient();

  const get = <TData = unknown>(endpoint: string, options: QueryConfig<TData> = {}) => {
    const {
      sort,
      filter,
      joins,
      search,
      nearby,
      hidden,
      fields,
      session,
      validation,
      permissions,
      page,
      retries,
      prefetch = false,
      ...queryConfig
    } = options;

    const frontQLOptions: FrontQLOptions = {
      sort,
      filter,
      joins,
      search,
      nearby,
      hidden,
      fields,
      session,
      validation,
      permissions,
      page,
      retries,
    };

    const queryOptions: UseQueryOptions<TData, QueryError> = {
      queryKey: queryKeys.list(endpoint, frontQLOptions),
      queryFn: async () => {
        try {
          return await FrontQLApi.get<TData>(endpoint, transformOptions(frontQLOptions));
        } catch (error) {
          throw transformError(error);
        }
      },
      ...queryConfig,
    };

    // If prefetch is true, start loading the data immediately
    if (prefetch) {
      queryClient.prefetchQuery(queryOptions);
    }

    return useQuery(queryOptions);
  };

  const getById = <TData = unknown>(endpoint: string, id: string | number, options: QueryConfig<TData> = {}) => {
    const { fields, hidden, permissions, prefetch = false, ...queryConfig } = options;

    const frontQLOptions: FrontQLOptions = { fields, hidden, permissions };

    const queryOptions: UseQueryOptions<TData, QueryError> = {
      queryKey: queryKeys.detail(endpoint, id),
      queryFn: async () => {
        try {
          return await FrontQLApi.get(`${endpoint}/${id}`, transformOptions(frontQLOptions));
        } catch (error) {
          throw transformError(error);
        }
      },
      ...queryConfig,
    };

    if (prefetch) {
      queryClient.prefetchQuery(queryOptions);
    }

    return useQuery(queryOptions);
  };

  const getInfinite = <TData = unknown>(
    endpoint: string,
    {
      pageSize = 10,
      initialCursor = null,
      ...options
    }: InfiniteQueryConfig<PaginatedResponse<TData>> = {} as InfiniteQueryConfig<PaginatedResponse<TData>>
  ) => {
    const frontQLOptions: Omit<FrontQLOptions, "cursor"> & { pageSize?: number } = {
      ...options,
      pageSize,
    };

    const queryOptions: UseInfiniteQueryOptions<PaginatedResponse<TData>, QueryError> = {
      queryKey: queryKeys.infinite(endpoint, frontQLOptions),
      queryFn: async ({ pageParam }) => {
        try {
          const requestOptions = transformOptions({
            ...frontQLOptions,
            cursor: (pageParam as string | null) || undefined,
          });
          return await FrontQLApi.get(endpoint, requestOptions);
        } catch (error) {
          throw transformError(error);
        }
      },
      ...options,
      getNextPageParam: (lastPage: PaginatedResponse<TData>) => lastPage.nextCursor || null,
      initialPageParam: initialCursor,
    };

    return useInfiniteQuery(queryOptions);
  };

  const create = <TData = unknown, TVariables extends Partial<TData> = Partial<TData>>(
    endpoint: string,
    { optimistic = false, invalidateQueries = true, ...options }: MutationConfig<TData, QueryError, TVariables> = {}
  ) => {
    const queryKey = queryKeys.list(endpoint);

    return useMutation<TData, QueryError, TVariables, MutationContext<TData>>({
      mutationFn: async (data) => {
        try {
          return await FrontQLApi.post(endpoint, { body: data });
        } catch (error) {
          throw transformError(error);
        }
      },
      onMutate: async (newData) => {
        if (!optimistic) return { previousData: undefined };

        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<TData>(queryKey);

        if (previousData) {
          queryClient.setQueryData<TData>(queryKey, (old) => ({ ...old, ...(newData as unknown as TData) }));
        }

        return { previousData };
      },
      onError: (error, variables, context) => {
        if (context?.previousData && optimistic) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        options.onError?.(error, variables, context);
      },
      onSuccess: (data, variables, context) => {
        if (invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
        }
        options.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  const update = <TData = unknown, TVariables extends Partial<TData> = Partial<TData>>(
    endpoint: string,
    id: string | number,
    { optimistic = true, invalidateQueries = true, ...options }: MutationConfig<TData, QueryError, TVariables> = {}
  ) => {
    const queryKey = queryKeys.detail(endpoint, id);

    return useMutation<TData, QueryError, TVariables, MutationContext<TData>>({
      mutationFn: async (data) => {
        try {
          return await FrontQLApi.put(`${endpoint}/${id}`, { body: data });
        } catch (error) {
          throw transformError(error);
        }
      },
      onMutate: async (newData) => {
        if (!optimistic) return { previousData: undefined };

        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<TData>(queryKey);

        if (previousData) {
          queryClient.setQueryData<TData>(queryKey, (old) => ({ ...old, ...(newData as unknown as TData) }));
        }

        return { previousData };
      },
      onError: (error, variables, context) => {
        if (context?.previousData && optimistic) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        options.onError?.(error, variables, context);
      },
      onSuccess: (data, variables, context) => {
        if (invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
        }
        options.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  const remove = <TData = unknown>(
    endpoint: string,
    id: string | number,
    { optimistic = true, invalidateQueries = true, ...options }: MutationConfig<TData, QueryError, void> = {}
  ) => {
    const queryKey = queryKeys.detail(endpoint, id);

    return useMutation<TData, QueryError, void, MutationContext<TData>>({
      mutationFn: async () => {
        try {
          return await FrontQLApi.delete(`${endpoint}/${id}`);
        } catch (error) {
          throw transformError(error);
        }
      },
      onMutate: async () => {
        if (!optimistic) return { previousData: undefined };

        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<TData>(queryKey);

        if (previousData) {
          queryClient.removeQueries({ queryKey });
        }

        return { previousData };
      },
      onError: (error, variables, context) => {
        if (context?.previousData && optimistic) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        options.onError?.(error, variables, context);
      },
      onSuccess: (data, variables, context) => {
        if (invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
        }
        options.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  // Utility for parallel queries
  const getParallel = <TData = unknown>(
    queries: Array<{
      endpoint: string;
      options?: QueryConfig<TData>;
    }>
  ) => {
    return useQueries({
      queries: queries.map(({ endpoint, options = {} }) => ({
        ...get(endpoint, options),
        queryKey: queryKeys.list(endpoint, options),
      })),
    });
  };

  return {
    get,
    getById,
    getInfinite,
    getParallel,
    create,
    update,
    remove,
  };
}

// Error transformation utility
export const transformError = (error: unknown): QueryError => {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    if (error.response?.status === 422) {
      return {
        type: "validation",
        fields: error.response.data.errors || {},
        message: error.response.data.message || "Validation failed",
      };
    }
    return {
      type: "api",
      error,
      message: error.message || "API error occurred",
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: "network",
      message: error.message || "Network error occurred",
    };
  }

  // Handle unknown error types
  return {
    type: "network",
    message: error instanceof Object ? String(error) : "An unknown error occurred",
  };
};

// Exporting the wrapper methods for use in components
export const api = useApi();

// Exporting the QueryClientProvider for global usage
interface QueryProviderProps {
  children: ReactNode;
}

// export function QueryProvider({ children }: QueryProviderProps) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//     </QueryClientProvider>
//   );
// }

// Helper function to transform FrontQLOptions to RequestOptions
function transformOptions(options: FrontQLOptions): RequestOptions {
  // Only transform boolean values to strings, rest are passed through as-is
  return {
    ...options,
    hidden: options.hidden?.toString(),
    validation: options.validation?.toString(),
  };
}
