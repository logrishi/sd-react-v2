import { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource, axios } from "@/lib/vendors";

import tokens from "./tokens.json";

export const _BASE_URL = import.meta.env.VITE_BASE_URL;
export const _DATABASE = import.meta.env.VITE_DATABASE;
const FQ_LOCAL_URL = import.meta.env.VITE_FQ_LOCAL_URL;

// API Response type
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// API Error type
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
}

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add custom properties to AxiosRequestConfig
declare module "axios" {
  interface AxiosRequestConfig {
    retryCount?: number;
    maxRetries?: number;
  }
}

// Request interceptor
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

// Response interceptor
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

    // Handle retry logic
    if (
      originalRequest &&
      originalRequest.retryCount !== undefined &&
      originalRequest.maxRetries !== undefined &&
      originalRequest.retryCount < originalRequest.maxRetries
    ) {
      originalRequest.retryCount += 1;

      // Exponential backoff
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

// Browser-compatible hashing function
async function hashString(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 12);
}

// Helper to build query string for SQL operations
function buildSQLQuery(body: any): string {
  if (!body) return "";

  if (Array.isArray(body)) {
    return body.length === 1 ? JSON.stringify(body[0].sql) : JSON.stringify(body.map((b) => b.sql));
  }

  return JSON.stringify(body.sql);
}

// Helper to build request key
async function buildRequestKey(method: HttpMethod, url: string, options: RequestOptions): Promise<string> {
  if (!FQ_LOCAL_URL) throw new Error("FQ_LOCAL_URL is not defined");

  const _url = FQ_LOCAL_URL + url;
  const parsed_url = new URL(_url);
  const pathname = "/" + parsed_url.pathname.split("/")[1];
  const methodLower = method.toLowerCase();

  // Only include non-empty parameters
  const requestParams: Record<string, any> = {
    method: methodLower,
    pathname,
    fields: options.fields || undefined,
    hidden: options.hidden || undefined,
    filter: options.filter || undefined,
    nearby: options.nearby || undefined,
    collections: options.joins || undefined,
    permissions: options.permissions || undefined,
    validation: options.validation || undefined,
    search: options.search || undefined,
    sort: options.sort || undefined,
    page: options.page || undefined,
    // Only include body for GET, DELETE, PATCH requests
    ...(!["post", "put", "sql"].includes(methodLower) && {
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
  };
  // Remove undefined values to keep the key consistent
  Object.keys(requestParams).forEach((key) => requestParams[key] === undefined && delete requestParams[key]);

  return `${methodLower}:${pathname}>${await hashString(JSON.stringify(requestParams))}`;
}

// Helper to ensure method is valid
function ensureValidMethod(method: string): HttpMethod {
  if (!isHttpMethod(method)) {
    throw new Error(`Invalid HTTP method: ${method}`);
  }
  return method;
}

// Type guard for HttpMethod
function isHttpMethod(method: string): method is HttpMethod {
  return ["get", "post", "put", "delete", "patch", "sql"].includes(method.toLowerCase());
}

// Enhanced request configuration builder
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

  // Add headers if they exist
  if (hidden) headers.hidden = hidden;
  if (filter) headers.filter = filter;
  if (fields) headers.fields = fields;
  if (session) headers.session = session;
  if (joins) headers.collections = joins;
  if (validation) headers.validation = validation;
  if (permissions) headers.permissions = permissions;
  if (nearby) headers.nearby = nearby;

  // Add query params if they exist
  if (page) params.page = page;
  if (sort) params.sort = sort;
  if (search) params.search = search;

  // Get token or key
  const key = await buildRequestKey(method, endpoint, options);
  const token = typedTokens[key];

  if (!token) {
    headers["key"] = key;
  } else {
    headers.token = token;
  }

  return {
    method,
    url: endpoint,
    baseURL: token ? _BASE_URL : FQ_LOCAL_URL,
    headers,
    params,
    data: body,
    timeout: timeout || 30000,
    cancelToken: cancelToken?.token,
    retryCount: 0,
    maxRetries: retries,
  };
}

// Main request handler with error handling and loading state
async function makeRequest<T = any>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { loading = true } = options;

  try {
    if (loading) {
      console.log(`${method.toUpperCase()} Request Started: ${endpoint}`);
    }

    const config = await buildRequestConfig(method, endpoint, options);
    const response: AxiosResponse = await axiosInstance(config);

    return response.data; // Return the raw response data
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

// Helper function to build endpoint path
function buildEndpoint(resourceName: string, id?: string | number): string {
  const base = `/${resourceName}`;
  return id ? `${base}/${id}` : base;
}

// Auth resource type for authentication operations
type AuthResource<T = any, C = any> = {
  check: (credentials: C, options?: RequestOptions) => Promise<T>;
};

// Enhanced API interface with typed CRUD operations
type ApiInterface = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  post: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  put: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  patch: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  delete: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  sql: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  cancelRequest: () => CancelTokenSource;

  // Resource-based CRUD operations
  resource: <T = any>(
    resourceName: string
  ) => {
    getAll: (options?: RequestOptions) => Promise<T[]>;
    getOne: (id: string | number, options?: RequestOptions) => Promise<T>;
    create: (data: Partial<T>, options?: RequestOptions) => Promise<T>;
    update: (id: string | number, data: Partial<T>, options?: RequestOptions) => Promise<T>;
    remove: (id: string | number, options?: RequestOptions) => Promise<void>;
  };

  // Auth resource factory
  auth: <T = any, C = any>(resourceName: string) => AuthResource<T, C>;
};

// Create the API instance with all methods
const Api: ApiInterface = {
  get: (endpoint, options) => makeRequest("get", endpoint, options),
  post: (endpoint, options) => makeRequest("post", endpoint, options),
  put: (endpoint, options) => makeRequest("put", endpoint, options),
  patch: (endpoint, options) => makeRequest("patch", endpoint, options),
  delete: (endpoint, options) => makeRequest("delete", endpoint, options),
  sql: (endpoint, options) => makeRequest("post", `/sql-${endpoint.replace("/", "")}`, options),
  cancelRequest: () => axios.CancelToken.source(),

  // Resource-based CRUD operations
  resource: <T>(resourceName: string) => ({
    getAll: (options = {}) => makeRequest<T[]>("get", buildEndpoint(resourceName), options),
    getOne: (id, options = {}) => makeRequest<T>("get", buildEndpoint(resourceName, id), options),
    create: (data, options = {}) => makeRequest<T>("post", buildEndpoint(resourceName), { ...options, body: data }),
    update: (id, data, options = {}) =>
      makeRequest<T>("put", buildEndpoint(resourceName, id), { ...options, body: data }),
    remove: (id, options = {}) => makeRequest<void>("delete", buildEndpoint(resourceName, id), options),
  }),

  // Auth resource factory
  auth: <T>(resourceName: string) => ({
    check: (credentials, options = {}) =>
      makeRequest<T>("post", buildEndpoint(resourceName), { ...options, body: credentials }),
  }),
};

export default Api;
