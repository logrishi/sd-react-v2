import { CacheOptions, withCache } from "./cache";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";

import tokens from "./tokens.json";

export const _DATABASE = import.meta.env.VITE_DATABASE;
export const _BASE_URL = import.meta.env.VITE_BASE_URL;
export const LOCAL_HOST = import.meta.env.VITE_FQ_LOCAL_URL;

// Type Definitions
export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "sql";

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface RequestOptions {
  loading?: boolean;
  body?: any;
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

interface ResourceOptions {
  baseEndpoint?: string;
  defaultOptions?: RequestOptions;
}

interface Tokens {
  [key: string]: string;
}

const typedTokens: Tokens = tokens as Tokens;

// Create Axios Instance with Interceptors and Retry Logic
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
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

// Response Interceptor with Retry Logic
axiosInstance.interceptors.response.use(
  (response) => {
    console.debug("Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { retryCount?: number; maxRetries?: number };

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

// Key Generation Functions (preserved from api-old.ts)
function uniqueKey(input: string): string {
  let code = input.charCodeAt(0);
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    code = (code << 5) - code + char;
    code &= code;
  }

  // Custom base64 implementation to match Buffer.toString('base64')
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const codeStr = code.toString();
  let result = "";

  // Convert string to base64
  for (let i = 0; i < codeStr.length; i += 3) {
    const chunk = codeStr.slice(i, i + 3);
    // Pad with '=' as needed
    const padding = 3 - chunk.length;

    let bits = 0;
    for (let j = 0; j < chunk.length; j++) {
      bits = bits * 10 + parseInt(chunk[j]);
    }

    const bytes = [(bits >> 16) & 0xff, (bits >> 8) & 0xff, bits & 0xff];

    result += base64Chars[bytes[0] >> 2];
    result += base64Chars[((bytes[0] & 3) << 4) | (bytes[1] >> 4)];

    if (padding === 2) {
      result += "==";
    } else if (padding === 1) {
      result += base64Chars[((bytes[1] & 15) << 2) | (bytes[2] >> 6)];
      result += "=";
    } else {
      result += base64Chars[((bytes[1] & 15) << 2) | (bytes[2] >> 6)];
      result += base64Chars[bytes[2] & 63];
    }
  }

  return result.substring(0, 8);
}

function buildRequestKey(method: HttpMethod, url: string, options: RequestOptions): string {
  if (!LOCAL_HOST) throw new Error("LOCAL_HOST is not defined");
  const _url = LOCAL_HOST + url;
  const parsed_url = new URL(_url);
  const pathname = parsed_url.pathname;

  const request: any = {
    fields: options?.fields,
    hidden: options?.hidden,
    filter: options?.filter,
    nearby: options?.nearby,
    collections: options?.joins, // "joins" is sent as "collections"
    permissions: options?.permissions,
    validation: options?.validation,
  };

  request["body_is_array"] = Array.isArray(options.body || {});

  let tokenStr = pathname;
  for (let key in request) {
    if (request[key]) {
      tokenStr += key + ":" + request[key];
    }
  }

  return method + ":" + pathname + ">" + uniqueKey(tokenStr);
}

// Build Request Configuration (headers, params, etc.)
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

  // Generate key for token lookup
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

// Core Request Handler
async function makeRequest<T = any>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { loading = true } = options;

  try {
    if (loading) {
      console.log(`${method.toUpperCase()} Request Started: ${endpoint}`);
    }

    const config = await buildRequestConfig(method, endpoint, options);

    // Handle Caching for GET Requests
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
      console.log("Request canceled:", (error as Error).message);
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

// Helper to Build Endpoint Paths
function buildEndpoint(resourceName: string, id?: string | number): string {
  const base = `/${resourceName}`;
  return id ? `${base}/${id}` : base;
}

// Query Builder Class
class QueryBuilder<T = any> {
  private resourceName: string;
  private queryOptions: RequestOptions;
  private idValue?: string | number;

  constructor(resourceName: string, options: RequestOptions = {}) {
    this.resourceName = resourceName;
    this.queryOptions = { ...options };
  }

  // Filter methods
  filter(filter: string): QueryBuilder<T> {
    this.queryOptions.filter = filter;
    return this;
  }

  // Pagination
  page(page: number | string): QueryBuilder<T> {
    this.queryOptions.page = page;
    return this;
  }

  // Sorting
  sort(sort: string): QueryBuilder<T> {
    this.queryOptions.sort = sort;
    return this;
  }

  // Field selection
  fields(fields: string | string[]): QueryBuilder<T> {
    this.queryOptions.fields = Array.isArray(fields) ? fields.join(",") : fields;
    return this;
  }

  // Search
  search(term: string): QueryBuilder<T> {
    this.queryOptions.search = term;
    return this;
  }

  // Join related resources
  join(joins: string): QueryBuilder<T> {
    this.queryOptions.joins = joins;
    return this;
  }

  // Include hidden fields
  includeHidden(hidden: string): QueryBuilder<T> {
    this.queryOptions.hidden = hidden;
    return this;
  }

  // Nearby
  nearby(nearby: string): QueryBuilder<T> {
    this.queryOptions.nearby = nearby;
    return this;
  }

  // Session
  withSession(session: string): QueryBuilder<T> {
    this.queryOptions.session = session;
    return this;
  }

  // Resource ID
  withId(id: string | number): QueryBuilder<T> {
    this.idValue = id;
    return this;
  }

  // Request body
  withBody(body: any): QueryBuilder<T> {
    this.queryOptions.body = body;
    return this;
  }

  // Caching options
  cache(enabled: boolean, duration?: number): QueryBuilder<T> {
    this.queryOptions.cacheOptions = {
      enabled,
      duration,
      ...(this.queryOptions.cacheOptions || {}),
    };
    return this;
  }

  // Timeout
  timeout(ms: number): QueryBuilder<T> {
    this.queryOptions.timeout = ms;
    return this;
  }

  // Retries
  retries(count: number): QueryBuilder<T> {
    this.queryOptions.retries = count;
    return this;
  }

  // Cancel token
  withCancelToken(token: CancelTokenSource): QueryBuilder<T> {
    this.queryOptions.cancelToken = token;
    return this;
  }

  // Execution methods
  async getAll(): Promise<T[]> {
    const endpoint = buildEndpoint(this.resourceName);
    return makeRequest<T[]>("get", endpoint, this.queryOptions);
  }

  async get(): Promise<T> {
    if (!this.idValue) {
      throw new Error("ID is required for get() operation. Use withId() to set it.");
    }
    const endpoint = buildEndpoint(this.resourceName, this.idValue);
    return makeRequest<T>("get", endpoint, this.queryOptions);
  }

  async create(): Promise<T> {
    if (!this.queryOptions.body) {
      throw new Error("Body is required for create() operation. Use withBody() to set it.");
    }
    const endpoint = buildEndpoint(this.resourceName);
    return makeRequest<T>("post", endpoint, this.queryOptions);
  }

  async update(): Promise<T> {
    if (!this.idValue) {
      throw new Error("ID is required for update() operation. Use withId() to set it.");
    }
    if (!this.queryOptions.body) {
      throw new Error("Body is required for update() operation. Use withBody() to set it.");
    }
    const endpoint = buildEndpoint(this.resourceName, this.idValue);
    return makeRequest<T>("put", endpoint, this.queryOptions);
  }

  async patch(): Promise<T> {
    if (!this.idValue) {
      throw new Error("ID is required for patch() operation. Use withId() to set it.");
    }
    if (!this.queryOptions.body) {
      throw new Error("Body is required for patch() operation. Use withBody() to set it.");
    }
    const endpoint = buildEndpoint(this.resourceName, this.idValue);
    return makeRequest<T>("patch", endpoint, this.queryOptions);
  }

  async delete(): Promise<void> {
    if (!this.idValue) {
      throw new Error("ID is required for delete() operation. Use withId() to set it.");
    }
    const endpoint = buildEndpoint(this.resourceName, this.idValue);
    return makeRequest<void>("delete", endpoint, this.queryOptions);
  }

  // Generic execute method
  async execute<R = T>(method: HttpMethod = "get"): Promise<R> {
    const endpoint = this.idValue ? buildEndpoint(this.resourceName, this.idValue) : buildEndpoint(this.resourceName);
    return makeRequest<R>(method, endpoint, this.queryOptions);
  }
}

// Resource Manager Class
class ResourceManager<T = any> {
  private resourceName: string;
  private defaultOptions: RequestOptions;

  constructor(resourceName: string, options: ResourceOptions = {}) {
    this.resourceName = resourceName;
    this.defaultOptions = options.defaultOptions || {};
  }

  // Create a query builder for this resource
  query(options: RequestOptions = {}): QueryBuilder<T> {
    return new QueryBuilder<T>(this.resourceName, { ...this.defaultOptions, ...options });
  }

  // Standard CRUD operations (for backward compatibility)
  async getAll(options: RequestOptions = {}): Promise<T[]> {
    return this.query(options).getAll();
  }

  async getOne(id: string | number, options: RequestOptions = {}): Promise<T> {
    return this.query(options).withId(id).get();
  }

  async create(data: any, options: RequestOptions = {}): Promise<T> {
    return this.query(options).withBody(data).create();
  }

  async update(id: string | number, data: any, options: RequestOptions = {}): Promise<T> {
    return this.query(options).withId(id).withBody(data).update();
  }

  async patch(id: string | number, data: any, options: RequestOptions = {}): Promise<T> {
    return this.query(options).withId(id).withBody(data).patch();
  }

  async remove(id: string | number, options: RequestOptions = {}): Promise<void> {
    return this.query(options).withId(id).delete();
  }
}

// Auth Resource Type
type AuthResource<T = any, C = any> = {
  check: (credentials: C, options?: RequestOptions) => Promise<T>;
};

// Main API Interface
interface ApiInterface {
  // Direct HTTP methods
  get: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  post: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  put: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  patch: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  delete: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
  sql: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;

  // Resource methods
  resource: <T = any>(resourceName: string, options?: ResourceOptions) => ResourceManager<T>;
  query: <T = any>(resourceName: string, options?: RequestOptions) => QueryBuilder<T>;

  // Auth method
  auth: <T = any, C = any>(resourceName: string) => AuthResource<T, C>;

  // Utilities
  cancelRequest: () => CancelTokenSource;
}

// Implement API Interface
const Api: ApiInterface = {
  // Direct HTTP methods (compatible with api-old.ts)
  get: (endpoint, options) => makeRequest("get", endpoint, options),
  post: (endpoint, options) => makeRequest("post", endpoint, options),
  put: (endpoint, options) => makeRequest("put", endpoint, options),
  patch: (endpoint, options) => makeRequest("patch", endpoint, options),
  delete: (endpoint, options) => makeRequest("delete", endpoint, options),
  sql: (endpoint, options) => makeRequest("post", `/sql-${endpoint.replace("/", "")}`, options),

  // Resource-based methods
  resource: <T>(resourceName: string, options?: ResourceOptions) => new ResourceManager<T>(resourceName, options),

  // Query builder method
  query: <T>(resourceName: string, options?: RequestOptions) => new QueryBuilder<T>(resourceName, options),

  // Auth method
  auth: <T, C>(resourceName: string) => ({
    check: (credentials: C, options = {}) =>
      makeRequest<T>("post", buildEndpoint(resourceName), {
        ...options,
        body: credentials,
        cacheOptions: { enabled: false, ...(options.cacheOptions || {}) },
      }),
  }),

  // Utilities
  cancelRequest: () => axios.CancelToken.source(),
};

export default Api;
