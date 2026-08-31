/**
 * 공통 API 클라이언트
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, NetworkError, UnauthorizedError } from './errors';
import { getOrCreateDeviceId } from '@/shared/lib/deviceId';
import type { UserRole } from '@/shared/types';

// 프로덕션 빌드에서만 SecureStore import
let SecureStore: any = null;
if (!__DEV__) {
  try {
    // eslint-disable-next-line global-require
    SecureStore = require('expo-secure-store');
  } catch (error) {
    console.warn('SecureStore not available');
  }
}

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;
const AUTH_TOKEN_KEY = 'haemi_auth_token';
const REFRESH_TOKEN_KEY = 'haemi_refresh_token';
const AUTH_ROLE_KEY = 'haemi_auth_role';

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set');
}

// 프로덕션에서만 SecureStore 사용 (존재 여부 확인)
const useSecureStorage = !__DEV__ && Boolean(SecureStore);

let cachedToken: string | null = null;
let isRefreshingToken = false;
let refreshTokenPromise: Promise<string | null> | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: (() => void) | null) => {
  onUnauthorizedCallback = callback;
};

const setTokenStorage = async (key: string, value: string | null) => {
  if (useSecureStorage) {
    try {
      if (value) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`Failed to store ${key} in SecureStore:`, error);
    }
  } else {
    try {
      if (value) {
        await AsyncStorage.setItem(key, value);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to store ${key} in AsyncStorage:`, error);
    }
  }
};

const getTokenStorage = async (key: string): Promise<string | null> => {
  if (useSecureStorage) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`Failed to retrieve ${key} from SecureStore:`, error);
      return null;
    }
  } else {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to retrieve ${key} from AsyncStorage:`, error);
      return null;
    }
  }
};

export const setAuthToken = async (token: string | null) => {
  cachedToken = token;
  await setTokenStorage(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;

  const token = await getTokenStorage(AUTH_TOKEN_KEY);
  if (token) cachedToken = token;
  return token;
};

export const setRefreshToken = async (token: string | null) => {
  await setTokenStorage(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return getTokenStorage(REFRESH_TOKEN_KEY);
};

export const setAuthRole = async (role: UserRole | null): Promise<void> => {
  await setTokenStorage(AUTH_ROLE_KEY, role);
};

export const getAuthRole = async (): Promise<UserRole | null> => {
  const role = await getTokenStorage(AUTH_ROLE_KEY);
  return role === 'ELDER' || role === 'FAMILY' || role === 'INSTITUTION_ADMIN' ? role : null;
};

const refreshAuthToken = async (): Promise<string | null> => {
  if (isRefreshingToken && refreshTokenPromise) {
    return refreshTokenPromise;
  }

  isRefreshingToken = true;
  refreshTokenPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      const url = `${API_BASE_URL}/auth/refresh`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, max-age=0',
        },
        body: JSON.stringify({ refreshToken, deviceId: await getOrCreateDeviceId() }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await setAuthToken(null);
          await setRefreshToken(null);
          if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
          }
        }
        return null;
      }

      const data = await response.json();
      if (data.data?.accessToken) {
        const newAccessToken = data.data.accessToken;
        await setAuthToken(newAccessToken);

        if (data.data.refreshToken) {
          await setRefreshToken(data.data.refreshToken);
        }

        return newAccessToken;
      }

      return null;
    } catch (error) {
      if (__DEV__) {
        console.warn('Token refresh failed:', error);
      }
      await setAuthToken(null);
      await setRefreshToken(null);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      return null;
    } finally {
      isRefreshingToken = false;
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

const getHeaders = async (skipAuth = false): Promise<HeadersInit> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async <T>(response: Response, retryRequest?: () => Promise<Response>): Promise<T> => {
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && retryRequest) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        const retryResponse = await retryRequest();
        return handleResponse<T>(retryResponse);
      }

      await setAuthToken(null);
      await setRefreshToken(null);
      throw new UnauthorizedError();
    }

    throw new ApiError(
      response.status,
      data?.error?.message || data?.message || `HTTP ${response.status}`,
      data?.error?.code || data?.code,
      data?.error?.details || data?.details
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
  const { skipAuth = false, timeout = 30000, headers: customHeaders, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders(skipAuth);
  const mergedHeaders = { ...headers, ...(customHeaders as HeadersInit) };

  const makeRequest = async (): Promise<Response> => {
    return withTimeout(
      fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
      }),
      timeout
    );
  };

  try {
    const response = await makeRequest();

    const retryRequest = skipAuth ? undefined : makeRequest;
    return handleResponse<T>(response, retryRequest);
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

export const apiClient = {
  get,
  post,
  patch,
  put,
  delete: del,
};
