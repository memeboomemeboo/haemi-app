import { setAuthToken } from '@/entities/group';

let currentToken: string | null = null;

export const getAuthToken = () => currentToken;

export const setCurrentAuthToken = (token: string) => {
  currentToken = token;
  setAuthToken(token);
};

export const clearAuthToken = () => {
  currentToken = null;
  setAuthToken('');
};

/**
 * 토큰 초기화 (개발용)
 * ⚠️ 프로덕션에서는 사용 금지
 * 실제 토큰은 로그인 API에서 받아야 함
 */
export const initializeTestToken = () => {
  // TODO: 실제 환경에서는 로그인 API에서 토큰 받기
  // const token = await loginAPI.login(credentials);

  // 개발 환경에서만 임시 토큰 사용
  if (process.env.NODE_ENV === 'development') {
    const testToken = process.env.EXPO_PUBLIC_TEST_TOKEN || '';
    if (!testToken) {
      console.warn('⚠️ No test token provided. Set EXPO_PUBLIC_TEST_TOKEN environment variable.');
    }
    setCurrentAuthToken(testToken);
    return testToken;
  }

  throw new Error('Test token not available in production');
};
