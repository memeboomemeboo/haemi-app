const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly response: string,
    message?: string,
  ) {
    super(message || `API Error: ${status}`);
    this.name = 'ApiError';
  }
}

/**
 * 재시도 가능한 네트워크 요청 수행
 */
async function requestWithRetry<T>(
  path: string,
  init?: RequestInit,
  retries: number = 0
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new ApiError(response.status, responseText);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // 네트워크 에러 또는 5xx 에러인 경우 재시도
    const isRetryable =
      error instanceof TypeError ||
      (error instanceof ApiError && error.status >= 500);

    if (isRetryable && retries < MAX_RETRIES) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * (retries + 1))
      );
      return requestWithRetry<T>(path, init, retries + 1);
    }

    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string) => requestWithRetry<T>(path),
  post: <T>(path: string, body?: unknown) =>
    requestWithRetry<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    requestWithRetry<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    requestWithRetry<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => requestWithRetry<T>(path, { method: 'DELETE' }),
};
