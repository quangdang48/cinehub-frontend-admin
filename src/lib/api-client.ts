import { auth } from "@/modules/auth/auth";
import {
  handleApiError,
} from "./errors";
import { API_URL } from "@/config";
import { ApiError } from "@/types/api";

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

interface FetchClientConfig {
  baseUrl: string;
  defaultHeaders: HeadersInit;
}

const defaultConfig: FetchClientConfig = {
  baseUrl: API_URL,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

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

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();
  if (!session?.accessToken) {
    return {};
  }
  return {
    Authorization: `Bearer ${session.accessToken}`,
  };
}

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
      cache: restOptions.method === "GET" ? "default" : "no-store",
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "An error occurred";
      throw new ApiError(response.status, errorMessage, data.errors);
    }

    return data as T;
  } catch (error) {
    handleApiError(error);
  }
}

export const api = {
  get: <T>(
    endpoint: string,
    params?: FetchOptions["params"],
    options?: Omit<FetchOptions, "params" | "body">
  ) => fetchClient<T>(endpoint, { ...options, params, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">
  ) => fetchClient<T>(endpoint, { ...options, body, method: "POST" }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body">
  ) => fetchClient<T>(endpoint, { ...options, body, method: "PUT" }),

  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "body">) =>
    fetchClient<T>(endpoint, { ...options, method: "DELETE" }),
};

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
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Upload failed");
  }

  return data;
}
