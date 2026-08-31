import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'haemi_device_id';

const createDeviceId = (): string => {
  const randomPart = Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('');
  return `haemi-${Date.now().toString(36)}-${randomPart}`;
};

/** 앱 설치 단위로 한 번 생성하고 계속 재사용하는 서버 인증용 deviceId. */
export const getOrCreateDeviceId = async (): Promise<string> => {
  const savedDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (savedDeviceId) return savedDeviceId;

  const deviceId = createDeviceId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  return deviceId;
};
