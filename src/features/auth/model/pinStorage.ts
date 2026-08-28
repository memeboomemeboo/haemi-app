import * as SecureStore from 'expo-secure-store';

const LOGIN_ID_KEY = 'haemi_login_id';

export const pinStorage = {
  hasLoginId: async (): Promise<boolean> => Boolean(await SecureStore.getItemAsync(LOGIN_ID_KEY)),
  saveLoginId: async (loginId: string): Promise<void> => SecureStore.setItemAsync(LOGIN_ID_KEY, loginId),
  getLoginId: async (): Promise<string | null> => SecureStore.getItemAsync(LOGIN_ID_KEY),
};
