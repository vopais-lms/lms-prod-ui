/**
 * Base configuration and generic response/error handling for API requests
 */

import type { LoginResponse } from '../apis/types';
import { clearSession, getStoredRefreshToken, storeTokens } from './authSession';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/customer_login',
  '/auth/authenticate_customer_otp',
  '/auth/refresh_token',
  '/tenant_details/register',
  '/tenant_details/',
];

const isPublicEndpoint = (endpoint: string): boolean =>
  PUBLIC_AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path)) ||
  endpoint.includes('/public_verify');

export interface ApiErrorResponse {
  message: string;
  status: number;
  data?: any;
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as LoginResponse;
    if (!data.access_token || !data.refresh_token) return false;

    storeTokens(data);
    return true;
  } catch {
    return false;
  }
};

const refreshAccessTokenOnce = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const parseFastApiError = (data: unknown): string => {
  if (!data || typeof data !== 'object') {
    return 'An error occurred during the request';
  }

  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }
        return String(item);
      })
      .join(', ');
  }

  if (typeof (data as { message?: unknown }).message === 'string') {
    return (data as { message: string }).message;
  }

  return 'An error occurred during the request';
};

const shouldRedirectOnUnauthorized = (endpoint: string, hadToken: boolean): boolean => {
  if (!hadToken) return false;
  return !isPublicEndpoint(endpoint);
};

const canAttemptTokenRefresh = (
  endpoint: string,
  status: number,
  hadToken: boolean,
  isRetry: boolean,
): boolean =>
  status === 401 &&
  hadToken &&
  !isRetry &&
  !isPublicEndpoint(endpoint);

/**
 * Helper to build query string from an object
 */
const buildQueryString = (params?: Record<string, string | number | boolean | undefined>): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

/**
 * Standard fetch wrapper
 */
export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> => {
  const { params, headers: customHeaders, ...customConfig } = options;

  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_API_MOCKS === 'true') {
    const { handleMockApiRequest } = await import('../mocks/localApi');
    return handleMockApiRequest<T>(endpoint, { ...customConfig, params });
  }

  const token = localStorage.getItem('auth_token');
  const isFormData = customConfig.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const url = `${BASE_URL}${endpoint}${buildQueryString(params)}`;

  try {
    const response = await fetch(url, config);
    const data = await parseResponseBody(response);

    if (!response.ok) {
      if (canAttemptTokenRefresh(endpoint, response.status, Boolean(token), isRetry)) {
        const refreshed = await refreshAccessTokenOnce();
        if (refreshed) {
          return apiClient<T>(endpoint, options, true);
        }
      }

      if (response.status === 401 && shouldRedirectOnUnauthorized(endpoint, Boolean(token))) {
        clearSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      throw new ApiError(parseFastApiError(data), response.status, data);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown network error',
      500
    );
  }
};

/**
 * Pre-configured methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
