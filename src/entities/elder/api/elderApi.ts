import { apiClient, authService } from '@/shared/api';
import type { ElderProfile } from '../model/types';
import { MOCK_ELDER_PROFILE } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = true;

export async function fetchElderProfile(): Promise<ElderProfile> {
  if (USE_MOCK) {
    return MOCK_ELDER_PROFILE;
  }
  return apiClient.get<ElderProfile>('/elder/me');
}

export async function verifyElderPin(pin: string): Promise<boolean> {
  if (USE_MOCK) {
    return pin.length === 6;
  }
  const result = await apiClient.post<{ verified: boolean }>('/elder/login', { pin });
  return result.verified;
}

export async function loginElderWithPin(pin: string): Promise<{ accessToken: string }> {
  return authService.loginElderWithPin(pin);
}
