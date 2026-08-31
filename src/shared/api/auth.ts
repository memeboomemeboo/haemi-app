/**
 * 인증 API
 */

import { post, get, setAuthToken as setClientToken, setRefreshToken as setClientRefreshToken } from './client';
import type {
  SignUpRequest,
  LoginRequest,
  AuthResponse,
  TotpSetupResponse,
  TotpVerifyResponse,
  RefreshTokenRequest,
  AuthUser,
  GuardianRegisterRequest,
  GuardianRegisterResponse,
  PinLoginRequest,
  PasswordLoginRequest,
  LoginIdAvailabilityResponse,
  GuardianProfileResponse,
  SwaggerApiResponse,
  TokenResponse,
  ApiResponse,
} from '@/shared/types';
import { getOrCreateDeviceId } from '@/shared/lib';

export const authService = {
  async checkLoginIdAvailability(loginId: string): Promise<LoginIdAvailabilityResponse> {
    const response = await get<SwaggerApiResponse<LoginIdAvailabilityResponse>>(
      `/auth/login-id/availability?loginId=${encodeURIComponent(loginId)}`,
      { skipAuth: true }
    );
    return response.data;
  },

  async requestEmailVerification(email: string): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>('/auth/email-verifications', { email }, {
      skipAuth: true,
    });
    return response.data;
  },

  async confirmEmailVerification(verificationId: string, code: string): Promise<void> {
    await post<SwaggerApiResponse<void>>(`/auth/email-verifications/${verificationId}/confirm`, { code }, {
      skipAuth: true,
    });
  },

  async registerGuardian(data: GuardianRegisterRequest): Promise<GuardianRegisterResponse> {
    const response = await post<SwaggerApiResponse<GuardianRegisterResponse>>('/auth/guardians/register', data, {
      skipAuth: true,
    });
    return response.data;
  },

  async loginWithPin(data: PinLoginRequest): Promise<TokenResponse> {
    const response = await post<SwaggerApiResponse<TokenResponse>>('/auth/login', data, {
      skipAuth: true,
    });
    return response.data;
  },

  async loginWithPassword(data: PasswordLoginRequest): Promise<TokenResponse> {
    const response = await post<SwaggerApiResponse<TokenResponse>>('/auth/login', data, {
      skipAuth: true,
    });
    return response.data;
  },

  async loginElderWithPin(pin: string): Promise<{ accessToken: string }> {
    const response = await post<SwaggerApiResponse<{ accessToken: string }>>('/auth/elders/login', { pin }, {
      skipAuth: true,
    });
    return response.data;
  },

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
    const response = await get<SwaggerApiResponse<GuardianProfileResponse>>('/guardian/profile');
    return {
      success: true,
      message: '',
      data: {
        memberId: response.data.userId,
        email: '',
        name: response.data.name,
        role: 'FAMILY',
      },
    };
  },

  async logout(): Promise<void> {
    try {
      await post('/auth/logout', { deviceId: await getOrCreateDeviceId() });
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

  async refreshToken(refreshToken: string): Promise<SwaggerApiResponse<TokenResponse>> {
    return post<SwaggerApiResponse<TokenResponse>>('/auth/refresh', {
      refreshToken,
      deviceId: await getOrCreateDeviceId(),
    } as RefreshTokenRequest & { deviceId: string }, {
      skipAuth: true,
    });
  },

  // 토큰 설정 (login 후 호출)
  async setToken(token: string) {
    await setClientToken(token);
  },

  // 리프레시 토큰 설정
  async setRefreshToken(token: string | null) {
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
