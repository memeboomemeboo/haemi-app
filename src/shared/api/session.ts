import AsyncStorage from '@react-native-async-storage/async-storage';

type SecureStoreModule = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

let secureStore: SecureStoreModule | undefined;

if (!__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    secureStore = require('expo-secure-store') as SecureStoreModule;
  } catch {
    secureStore = undefined;
  }
}

const AUTH_TOKEN_KEY = 'haemi_auth_token';
const REFRESH_TOKEN_KEY = 'haemi_refresh_token';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://54.180.61.149:8080';
let cachedAccessToken: string | null | undefined;
let refreshPromise: Promise<string | undefined> | undefined;

async function readStoredValue(key: string) {
  if (__DEV__ || !secureStore) return AsyncStorage.getItem(key);
  return secureStore.getItemAsync(key);
}

async function writeStoredValue(key: string, value: string | null) {
  if (__DEV__ || !secureStore) {
    if (value) await AsyncStorage.setItem(key, value);
    else await AsyncStorage.removeItem(key);
    return;
  }

  if (value) await secureStore.setItemAsync(key, value);
  else await secureStore.deleteItemAsync(key);
}

function isExpiredJwt(token: string) {
  try {
    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = encodedPayload.padEnd(encodedPayload.length + ((4 - encodedPayload.length % 4) % 4), '=');
    const payload = JSON.parse(globalThis.atob(paddedPayload)) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000) + 30;
  } catch {
    return false;
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await readStoredValue(REFRESH_TOKEN_KEY);
    if (!refreshToken) return undefined;

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body = await response.json() as {
      success?: boolean;
      data?: { accessToken?: string; refreshToken?: string };
    };

    if (!response.ok || !body.success || !body.data?.accessToken) {
      await clearAccessToken();
      return undefined;
    }

    cachedAccessToken = body.data.accessToken;
    await writeStoredValue(AUTH_TOKEN_KEY, body.data.accessToken);
    if (body.data.refreshToken) await writeStoredValue(REFRESH_TOKEN_KEY, body.data.refreshToken);
    return body.data.accessToken;
  })().finally(() => { refreshPromise = undefined; });

  return refreshPromise;
}

export async function getAccessToken() {
  if (cachedAccessToken === undefined) cachedAccessToken = await readStoredValue(AUTH_TOKEN_KEY);
  if (cachedAccessToken && isExpiredJwt(cachedAccessToken)) return refreshAccessToken();
  return cachedAccessToken ?? undefined;
}

export async function setAccessToken(nextAccessToken: string) {
  cachedAccessToken = nextAccessToken;
  await writeStoredValue(AUTH_TOKEN_KEY, nextAccessToken);
}

export async function clearAccessToken() {
  cachedAccessToken = null;
  await Promise.all([
    writeStoredValue(AUTH_TOKEN_KEY, null),
    writeStoredValue(REFRESH_TOKEN_KEY, null),
  ]);
}
