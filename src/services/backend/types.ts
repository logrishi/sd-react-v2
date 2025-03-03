import type { AxiosError } from 'axios';

export type ApiError = {
  type: 'api';
  error: AxiosError;
  message: string;
};

export type ValidationError = {
  type: 'validation';
  fields: Record<string, string[]>;
  message: string;
};

export type NetworkError = {
  type: 'network';
  message: string;
};

export type QueryError = ApiError | ValidationError | NetworkError;

export type SortOption = {
  field: string;
  direction: 'asc' | 'desc';
};

export type FilterOption = {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'like';
  value: unknown;
};

export type NearbyOption = {
  lat: number;
  lng: number;
  radius: number;
};

export type FrontQLOptions = {
  sort?: string | SortOption[];
  filter?: string | FilterOption[];
  joins?: string | string[];
  search?: string;
  nearby?: NearbyOption;
  hidden?: boolean;
  fields?: string | string[];
  session?: string;
  validation?: boolean;
  permissions?: string | string[];
  page?: number;
  retries?: number;
  cursor?: string;
};
