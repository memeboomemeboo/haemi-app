import { apiClient } from '@/shared/api';
import type { Activity } from '../model/types';
import { MOCK_TODAY_ACTIVITIES } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = true;

export async function fetchTodayActivities(): Promise<Activity[]> {
  if (USE_MOCK) {
    return MOCK_TODAY_ACTIVITIES;
  }
  return apiClient.get<Activity[]>('/activities/today');
}
