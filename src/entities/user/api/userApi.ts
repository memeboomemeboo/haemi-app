import { apiClient } from '@/shared/api';
import type { SeniorProfile } from '../model/types';

export async function fetchSeniorProfile(): Promise<SeniorProfile> {
  return apiClient.get<SeniorProfile>('/senior/profile');
}
