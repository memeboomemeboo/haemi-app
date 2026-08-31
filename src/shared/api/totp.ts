/**
 * TOTP 백업 코드 관리
 * 개발: AsyncStorage | 프로덕션: SecureStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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

const BACKUP_CODES_KEY = 'totp_backup_codes';
const USED_BACKUP_CODES_KEY = 'totp_used_backup_codes';

// 프로덕션에서만 SecureStore 사용 (존재 여부 확인)
const useSecureStorage = !__DEV__ && Boolean(SecureStore);

const setBackupStorage = async (key: string, value: string) => {
  if (useSecureStorage) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`Failed to store ${key} in SecureStore:`, error);
    }
  } else {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to store ${key} in AsyncStorage:`, error);
    }
  }
};

const getBackupStorage = async (key: string): Promise<string | null> => {
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

const deleteBackupStorage = async (key: string) => {
  if (useSecureStorage) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`Failed to delete ${key} from SecureStore:`, error);
    }
  } else {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to delete ${key} from AsyncStorage:`, error);
    }
  }
};

export const saveTotpBackupCodes = async (codes: string[]): Promise<void> => {
  await setBackupStorage(BACKUP_CODES_KEY, JSON.stringify(codes));
  // 사용한 코드 목록 초기화
  await setBackupStorage(USED_BACKUP_CODES_KEY, JSON.stringify([]));
};

export const getTotpBackupCodes = async (): Promise<string[]> => {
  const codes = await getBackupStorage(BACKUP_CODES_KEY);
  if (!codes) return [];
  try {
    return JSON.parse(codes);
  } catch {
    return [];
  }
};

export const useTotpBackupCode = async (code: string): Promise<boolean> => {
  const availableCodes = await getTotpBackupCodes();
  const usedCodes = await getUsedBackupCodes();

  // 이미 사용한 코드인지 확인
  if (usedCodes.includes(code)) return false;

  // 사용 가능한 코드인지 확인
  if (!availableCodes.includes(code)) return false;

  // 사용 코드 목록에 추가
  usedCodes.push(code);
  await setBackupStorage(USED_BACKUP_CODES_KEY, JSON.stringify(usedCodes));

  return true;
};

export const getUsedBackupCodes = async (): Promise<string[]> => {
  const codes = await getBackupStorage(USED_BACKUP_CODES_KEY);
  if (!codes) return [];
  try {
    return JSON.parse(codes);
  } catch {
    return [];
  }
};

export const clearTotpBackupCodes = async (): Promise<void> => {
  await deleteBackupStorage(BACKUP_CODES_KEY);
  await deleteBackupStorage(USED_BACKUP_CODES_KEY);
};

export const getAvailableBackupCodeCount = async (): Promise<number> => {
  const total = await getTotpBackupCodes();
  const used = await getUsedBackupCodes();
  return Math.max(0, total.length - used.length);
};
