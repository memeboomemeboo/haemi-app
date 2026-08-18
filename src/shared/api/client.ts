/**
 * 공통 API 클라이언트
 */

import type { ApiResponse } from '@/shared/types';
import { ApiError, NetworkError, UnauthorizedError } from './errors';

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set');
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

const getHeaders = (skipAuth = false): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      throw new UnauthorizedError();
    }

    throw new ApiError(
      response.status,
      data?.message || `HTTP ${response.status}`,
      data?.code,
      data?.details
    );
  }

  return data;
};

const withTimeout = (promise: Promise<Response>, ms: number): Promise<Response> => {
  return Promise.race([
    promise,
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new NetworkError('Request timeout')), ms)
    ),
  ]);
};

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, timeout = 30000, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders(skipAuth);

  try {
    const response = await withTimeout(
      fetch(url, {
        ...fetchOptions,
        headers: { ...headers, ...(fetchOptions.headers as HeadersInit) },
      }),
      timeout
    );

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    throw new NetworkError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function get<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'GET' });
}

export async function post<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function put<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
}
