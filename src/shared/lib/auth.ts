/**
 * 인증 토큰 관리
 * API 클라이언트의 setAuthToken과 동기화
 */

import { setAuthToken as setClientToken, getAuthToken as getClientToken } from '@/shared/api';
import { isAccessTokenExpired } from './jwt';

export const getAuthToken = async () => getClientToken();

export const setCurrentAuthToken = async (token: string) => {
  await setClientToken(token);
};

export const clearAuthToken = async () => {
  await setClientToken(null);
};

/**
 * 개발 환경에서 테스트 토큰 초기화
 * ⚠️ 프로덕션에서는 사용 금지
 */
export const initializeTestToken = async () => {
  if (__DEV__) {
    const testToken = process.env.EXPO_PUBLIC_TEST_TOKEN;
    if (testToken) {
      if (isAccessTokenExpired(testToken)) {
        const storedToken = await getClientToken();
        if (storedToken === testToken) {
          await setClientToken(null);
        }
        if (__DEV__) {
          console.warn('EXPO_PUBLIC_TEST_TOKEN이 만료되어 자동 로그인을 건너뜁니다.');
        }
        return;
      }
      await setCurrentAuthToken(testToken);
    }
  }
};
