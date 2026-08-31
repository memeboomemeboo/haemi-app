import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'haemi_device_id';

const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
};

const store = Platform.OS === 'web' ? webStorage : {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

const createDeviceId = (): string => {
  const randomPart = Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('');
  return `haemi-${Date.now().toString(36)}-${randomPart}`;
};

/** 앱 설치 단위로 한 번 생성하고 계속 재사용하는 서버 인증용 deviceId. */
export const getOrCreateDeviceId = async (): Promise<string> => {
  const savedDeviceId = await store.getItem(DEVICE_ID_KEY);
  if (savedDeviceId) return savedDeviceId;

  const deviceId = createDeviceId();
  await store.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
};
