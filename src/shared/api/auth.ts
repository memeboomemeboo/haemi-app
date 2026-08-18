/**
 * 인증 API
 */

import { post, get, setAuthToken as setClientToken } from './client';
import type {
  SignUpRequest,
  LoginRequest,
  AuthResponse,
  TotpSetupResponse,
  TotpVerifyResponse,
  RefreshTokenRequest,
  AuthUser,
} from '@/shared/types';
import type { ApiResponse } from '@/shared/types';

export const authService = {
  async signup(data: SignUpRequest): Promise<ApiResponse<AuthResponse>> {
    return post<ApiResponse<AuthResponse>>('/auth/signup', data, {
      skipAuth: true,
    });
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return post<ApiResponse<AuthResponse>>('/auth/login', data, {
      skipAuth: true,
    });
  },

  async getMe(): Promise<ApiResponse<AuthUser>> {
    return get<ApiResponse<AuthUser>>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await post('/auth/logout', {});
    } finally {
      setClientToken(null);
    }
  },

  async setupTotp(): Promise<ApiResponse<TotpSetupResponse>> {
    return post<ApiResponse<TotpSetupResponse>>('/auth/totp/setup', {});
  },

  async verifyTotp(secret: string, code: string): Promise<ApiResponse<TotpVerifyResponse>> {
    return post<ApiResponse<TotpVerifyResponse>>('/auth/totp/verify', {
      secret,
      code,
    });
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    } as RefreshTokenRequest, {
      skipAuth: true,
    });
  },

  // 토큰 설정 (login 후 호출)
  setToken(token: string) {
    setClientToken(token);
  },

  // 토큰 초기화 (logout 후 호출)
  clearToken() {
    setClientToken(null);
  },
};
