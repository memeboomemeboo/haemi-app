import { apiClient } from '@/shared/api';
import type { SeniorProfile } from '../model/types';
import { MOCK_SENIOR_PROFILE } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = true;

export async function fetchSeniorProfile(): Promise<SeniorProfile> {
  if (USE_MOCK) {
    return MOCK_SENIOR_PROFILE;
  }
  return apiClient.get<SeniorProfile>('/senior/profile');
}
