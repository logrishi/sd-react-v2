import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import FrontQLApi from "./api";

// Create a global query client
const queryClient = new QueryClient();

// Wrapper for API calls using React Query
const useApi = (globalOptions = {}) => {
  const client = useQueryClient();

  const get = async <T = any>(endpoint: string, options = {}): Promise<T> => {
    const { enabled = true, ...queryOptions } = { ...globalOptions, ...options };
    if (!enabled) return Promise.reject(new Error("Query is disabled"));

    return FrontQLApi.get<T>(endpoint, queryOptions);
  };

  const create = async <T = any>(endpoint: string, data: Partial<T>, options = {}): Promise<T> => {
    const { enabled = true, ...mutationOptions } = { ...globalOptions, ...options };
    if (!enabled) return Promise.reject(new Error("Mutation is disabled"));

    const response = await FrontQLApi.post<T>(endpoint, { body: data, ...mutationOptions });
    client.invalidateQueries({ queryKey: [endpoint] }); // Invalidate queries after creation
    return response;
  };

  const update = async <T = any>(endpoint: string, id: string | number, data: Partial<T>, options = {}): Promise<T> => {
    const { enabled = true, ...mutationOptions } = { ...globalOptions, ...options };
    if (!enabled) return Promise.reject(new Error("Mutation is disabled"));

    const response = await FrontQLApi.put<T>(`${endpoint}/${id}`, { body: data, ...mutationOptions });
    client.invalidateQueries({ queryKey: [endpoint, id] }); // Invalidate queries after update
    return response;
  };

  const remove = async (endpoint: string, id: string | number, options = {}): Promise<void> => {
    const { enabled = true, ...mutationOptions } = { ...globalOptions, ...options };
    if (!enabled) return Promise.reject(new Error("Mutation is disabled"));

    await FrontQLApi.delete(`${endpoint}/${id}`, mutationOptions);
    client.invalidateQueries({ queryKey: [endpoint] }); // Invalidate queries after deletion
  };

  return { get, create, update, remove };
};

// Exporting the wrapper methods for use in components
export const api = useApi();

// Exporting the QueryClient and QueryClientProvider for global usage
export { queryClient, QueryClientProvider };
