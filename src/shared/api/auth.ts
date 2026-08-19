/**
 * 인증 API
 */

import { post, get, setAuthToken as setClientToken, setRefreshToken as setClientRefreshToken } from './client';
import type {
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  AuthResponse,
  TotpSetupResponse,
  TotpVerifyResponse,
  RefreshTokenRequest,
  AuthUser,
  ApiResponse,
} from '@/shared/types';

export const authService = {
  async signup(data: SignUpRequest): Promise<ApiResponse<SignUpResponse>> {
    return post<ApiResponse<SignUpResponse>>('/auth/signup', data, {
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
      await setClientToken(null);
      await setClientRefreshToken(null);
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
  async setToken(token: string) {
    await setClientToken(token);
  },

  // 리프레시 토큰 설정
  async setRefreshToken(token: string) {
    await setClientRefreshToken(token);
  },

  // 토큰 초기화 (logout 후 호출)
  async clearToken() {
    await setClientToken(null);
    await setClientRefreshToken(null);
  },

  async updateProfile(data: { name?: string; password?: string }): Promise<ApiResponse<AuthUser>> {
    return post<ApiResponse<AuthUser>>('/auth/profile', data);
  },

};
