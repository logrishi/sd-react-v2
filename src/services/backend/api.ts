import { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource, axios } from "@/lib/vendors";
import tokens from "./tokens.json";
import { withCache } from "./cache";

export const _BASE_URL = import.meta.env.VITE_BASE_URL;
export const _DATABASE = import.meta.env.VITE_DATABASE;
const LOCAL_HOST = import.meta.env.VITE_FQ_LOCAL_URL;

//
// API Response and Error types
//
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

interface Tokens {
  [key: string]: string;
}
const typedTokens: Tokens = tokens as Tokens;

type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "sql";

interface SQLBody {
  sql: string;
  params: Array<{ [key: string]: string | number }>;
}

import { type CacheOptions } from "./cache";

interface RequestOptions {
  [key: string]: any;
  loading?: boolean;
  body?: any | SQLBody;
  key?: Record<string, string | any>;
  page?: number | string;
  sort?: string;
  joins?: string;
  filter?: string;
  search?: string;
  nearby?: string;
  hidden?: string;
  fields?: string;
  session?: string;
  validation?: string;
  permissions?: string;
  retries?: number;
  cancelToken?: CancelTokenSource;
  timeout?: number;
  cacheOptions?: CacheOptions;
}

//
// Helper: Unique Key Generation (matches api‑old.ts using btoa)
//
function uniqueKey(input: string): string {
  let code = input.charCodeAt(0);
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    code = (code << 5) - code + char;
    code &= code;
  }
  return btoa(code.toString()).substring(0, 8);
}

//
// Helper: Build Request Key (exactly like api‑old.ts)
//
// For GET requests, if the last segment of the URL is purely numeric,
// remove it so that different IDs generate the same key if all other conditions match.
//
function buildRequestKey(method: HttpMethod, url: string, options: RequestOptions): string {
  if (!LOCAL_HOST) throw new Error("LOCAL_HOST is not defined");
  const _url = LOCAL_HOST + url;
  const parsedUrl = new URL(_url);
  let pathname = parsedUrl.pathname;

  // For GET requests, remove trailing numeric segment if present.
  if (method === "get") {
    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1];
    if (/^\d+$/.test(lastSegment)) {
      segments.pop();
      pathname = segments.join("/") || "/";
    }
  }

  // Build request object as in api‑old.ts
  const request: any = {
    fields: options?.fields,
    hidden: options?.hidden,
    filter: options?.filter,
    nearby: options?.nearby,
    collections: options?.joins, // "joins" is sent as "collections"
    permissions: options?.permissions,
    validation: options?.validation,
  };
  // Emulate api‑old.ts flag for body_is_array
  request["body_is_array"] = Array.isArray(options.body || {});

  let tokenStr = pathname;
  for (let key in request) {
    if (request[key]) {
      tokenStr += key + ":" + request[key];
    }
  }
  // Final key format: "method:pathname>hash"
  return method + ":" + pathname + ">" + uniqueKey(tokenStr);
}

//
// Axios Instance & Interceptors (with retry logic)
//
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

declare module "axios" {
  interface AxiosRequestConfig {
    retryCount?: number;
    maxRetries?: number;
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    console.debug("Request:", {
      method: config.method,
      url: config.url,
      params: config.params,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.debug("Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (
      originalRequest &&
      originalRequest.retryCount !== undefined &&
      originalRequest.maxRetries !== undefined &&
      originalRequest.retryCount < originalRequest.maxRetries
    ) {
      originalRequest.retryCount += 1;
      const backoff = Math.pow(2, originalRequest.retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return axiosInstance(originalRequest);
    }
    console.error("Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

//
// Build Request Config: Sets headers (including token/key) as in api‑old.ts
//
async function buildRequestConfig(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions
): Promise<AxiosRequestConfig> {
  const {
    body,
    page,
    sort,
    joins,
    hidden,
    fields,
    filter,
    search,
    nearby,
    session,
    validation,
    permissions,
    retries = 3,
    timeout,
    cancelToken,
  } = options;

  const headers: Record<string, any> = { app: _DATABASE };
  const params: Record<string, any> = {};

  if (hidden) headers.hidden = hidden;
  if (filter) headers.filter = filter;
  if (fields) headers.fields = fields;
  if (session) headers.session = session;
  if (nearby) headers.nearby = nearby;
  if (joins) headers.collections = joins;
  if (validation) headers.validation = validation;
  if (permissions) headers.permissions = permissions;

  if (page) params.page = page;
  if (sort) params.sort = sort;
  if (search) params.search = search;

  // Generate the key using our (possibly normalized) pathname
  const key = buildRequestKey(method, endpoint, options);
  const token = typedTokens[key] || false;

  if (!token) {
    headers["key"] = key;
  } else {
    headers.token = token;
  }

  return {
    method,
    url: endpoint,
    baseURL: token ? _BASE_URL : LOCAL_HOST,
    headers,
    params,
    data: body,
    timeout: timeout || 30000,
    cancelToken: cancelToken?.token,
    retryCount: 0,
    maxRetries: retries,
  };
}

//
// Main Request Handler (with Caching support)
//
async function makeRequest<T = any>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { loading = true } = options;
  try {
    if (loading) {
      console.log(`${method.toUpperCase()} Request Started: ${endpoint}`);
    }
    const config = await buildRequestConfig(method, endpoint, options);

    // Wrap GET requests with caching (if enabled; default enabled)
    if (config.method?.toLowerCase() === "get" && options.cacheOptions?.enabled !== false) {
      return await withCache<T>(
        config,
        async () => {
          const response: AxiosResponse = await axiosInstance(config);
          return response.data;
        },
        options.cacheOptions
      );
    } else {
      const response: AxiosResponse = await axiosInstance(config);
      return response.data;
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message);
      throw error;
    }
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: (error as AxiosError)?.response?.status || 500,
      code: (error as AxiosError)?.code,
    };
    console.error(`${method.toUpperCase()} Error:`, apiError);
    throw apiError;
  } finally {
    if (loading) {
      console.log(`${method.toUpperCase()} Request Completed: ${endpoint}`);
    }
  }
}

//
// Helper to Build Endpoint Paths for Resources
//
function buildEndpoint(resourceName: string, id?: string | number): string {
  const base = `/${resourceName}`;
  return id ? `${base}/${id}` : base;
}

//
// Auth Resource Type
//
type AuthResource<T = any, C = any> = {
  check: (credentials: C, options?: RequestOptions) => Promise<T>;
};

//
// Enhanced API Interface (with Resource Routes, Auth, etc.)
//
type ApiInterface = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  post: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  put: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  patch: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  delete: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  sql: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  cancelRequest: () => CancelTokenSource;
  resource: <T = any>(
    resourceName: string
  ) => {
    getAll: (options?: RequestOptions) => Promise<T[]>;
    getOne: (id: string | number, options?: RequestOptions) => Promise<T>;
    create: (data: Partial<T>, options?: RequestOptions) => Promise<T>;
    update: (id: string | number, data: Partial<T>, options?: RequestOptions) => Promise<T>;
    remove: (id: string | number, options?: RequestOptions) => Promise<void>;
  };
  auth: <T = any, C = any>(resourceName: string) => AuthResource<T, C>;
};

const Api: ApiInterface = {
  get: (endpoint, options) => makeRequest("get", endpoint, options),
  post: (endpoint, options) => makeRequest("post", endpoint, options),
  put: (endpoint, options) => makeRequest("put", endpoint, options),
  patch: (endpoint, options) => makeRequest("patch", endpoint, options),
  delete: (endpoint, options) => makeRequest("delete", endpoint, options),
  sql: (endpoint, options) => makeRequest("post", `/sql-${endpoint.replace("/", "")}`, options),
  cancelRequest: () => axios.CancelToken.source(),
  resource: <T>(resourceName: string) => ({
    getAll: (options = {}) => makeRequest<T[]>("get", buildEndpoint(resourceName), options),
    getOne: (id, options = {}) => makeRequest<T>("get", buildEndpoint(resourceName, id), options),
    create: (data, options = {}) => makeRequest<T>("post", buildEndpoint(resourceName), { ...options, body: data }),
    update: (id, data, options = {}) =>
      makeRequest<T>("put", buildEndpoint(resourceName, id), { ...options, body: data }),
    remove: (id, options = {}) => makeRequest<void>("delete", buildEndpoint(resourceName, id), options),
  }),
  auth: <T>(resourceName: string) => ({
    check: (credentials, options = {}) =>
      makeRequest<T>("post", buildEndpoint(resourceName), { ...options, body: credentials }),
  }),
};

export default Api;
