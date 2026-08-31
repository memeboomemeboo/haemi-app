import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const LOGIN_ID_KEY = 'haemi_login_id';
const ELDER_LOGIN_ID_KEY = 'haemi_elder_login_id';

const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
};

const store = Platform.OS === 'web' ? webStorage : {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

export const pinStorage = {
  hasLoginId: async (): Promise<boolean> => Boolean(await store.getItem(LOGIN_ID_KEY)),
  saveLoginId: async (loginId: string): Promise<void> => { await store.setItem(LOGIN_ID_KEY, loginId); },
  getLoginId: async (): Promise<string | null> => store.getItem(LOGIN_ID_KEY),
  hasElderLoginId: async (): Promise<boolean> => Boolean(await store.getItem(ELDER_LOGIN_ID_KEY)),
  saveElderLoginId: async (loginId: string): Promise<void> => { await store.setItem(ELDER_LOGIN_ID_KEY, loginId); },
  getElderLoginId: async (): Promise<string | null> => store.getItem(ELDER_LOGIN_ID_KEY),
};
