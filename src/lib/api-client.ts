import { auth } from "@/modules/auth/auth";
import {
  ApiError,
  UnauthorizedError,
  ValidationError,
  handleApiError,
} from "./errors";
import { API_URL } from "@/config";

// ==================== Types ====================

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

interface FetchClientConfig {
  baseUrl: string;
  defaultHeaders: HeadersInit;
}

// ==================== Configuration ====================

const defaultConfig: FetchClientConfig = {
  baseUrl: API_URL,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

// ==================== Helper Functions ====================

/**
 * Build URL with query parameters
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(defaultConfig.baseUrl + endpoint);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Get authentication headers from session
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();

  if (!session?.accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.accessToken}`,
  };
}

// ==================== Main Fetch Client ====================

/**
 * Server-side fetch client with automatic token injection
 * Use this in Server Actions to call backend APIs
 */
export async function fetchClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

  try {
    const authHeaders = await getAuthHeaders();
    const url = buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        ...defaultConfig.defaultHeaders,
        ...authHeaders,
        ...customHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
      // Disable caching for mutations
      cache: restOptions.method === "GET" ? "default" : "no-store",
    });

    // Handle no content response
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "An error occurred";

      switch (response.status) {
        case 401:
          throw new UnauthorizedError(errorMessage);
        case 403:
          throw new ApiError(403, errorMessage);
        case 404:
          throw new ApiError(404, errorMessage);
        case 422:
          throw new ValidationError(errorMessage, data.errors);
        default:
          throw new ApiError(response.status, errorMessage);
      }
    }

    return data as T;
  } catch (error) {
    handleApiError(error);
  }
}

// ==================== HTTP Method Helpers ====================

export const api = {
  /**
   * GET request
   */
  get: <T>(
    endpoint: string,
    params?: FetchOptions["params"],
    options?: Omit<FetchOptions, "params" | "body">
  ) => fetchClient<T>(endpoint, { ...options, params, method: "GET" }),

  /**
   * POST request
   */
  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">
  ) => fetchClient<T>(endpoint, { ...options, body, method: "POST" }),

  /**
   * PUT request
   */
  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">
  ) => fetchClient<T>(endpoint, { ...options, body, method: "PUT" }),

  /**
   * PATCH request
   */
  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">
  ) => fetchClient<T>(endpoint, { ...options, body, method: "PATCH" }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "body">) =>
    fetchClient<T>(endpoint, { ...options, method: "DELETE" }),
};

// ==================== File Upload Helper ====================

/**
 * Upload file to backend
 */
export async function uploadFile<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const url = buildUrl(endpoint);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...authHeaders,
      // Don't set Content-Type for FormData, browser will set it automatically
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Upload failed");
  }

  return data;
}
