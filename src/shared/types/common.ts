/**
 * 공통 타입 정의
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type Result<T> = ApiResponse<T> | ApiError;

export type UserRole = 'FAMILY' | 'ELDER' | 'INSTITUTION_ADMIN';
export type Relation = 'SON' | 'DAUGHTER' | 'OTHER';
export type NotificationPreference = 'ALL' | 'IMPORTANT' | 'NONE';
