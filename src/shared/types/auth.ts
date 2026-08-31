/**
 * 인증 관련 타입 정의
 */

import type { UserRole } from './common';

// 요청 타입
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface GuardianRegisterRequest {
  name: string;
  loginId: string;
  password: string;
  birthDate: string;
  pin: string;
  inviteCode?: string;
  phone?: string;
  email?: string;
  emailVerificationId?: string;
}

export interface GuardianRegisterResponse {
  userId: string;
}

export interface LoginIdAvailabilityResponse {
  loginId: string;
  available: boolean;
}

export interface GuardianProfileResponse {
  userId: string;
  name: string;
  loginId: string;
  phone?: string;
  birthDate: string;
  profileImageUrl?: string;
}

export interface PinLoginRequest {
  loginId: string;
  pin: string;
  deviceId: string;
}

export interface PasswordLoginRequest {
  loginId: string;
  password: string;
  deviceId: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface EmailVerificationResponse {
  verificationId: string;
}

export interface SwaggerApiResponse<T> {
  data: T;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface TotpSetupRequest {
  secret: string;
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// 응답 타입
export interface AuthUser {
  memberId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse extends AuthUser, AuthTokens {
  totpEnabled?: boolean;
}

export interface TotpSetupResponse {
  secret: string;
  qrUri: string;
  backupCodes: string[];
}

export interface TotpVerifyResponse {
  verified: true;
  backupCodes: string[];
}

// 세션 타입
export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  expiresAt: number;
}
