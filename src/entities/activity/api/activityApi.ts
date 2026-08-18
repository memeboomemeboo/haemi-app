import { apiClient } from '@/shared/api';
import type { Activity } from '../model/types';

export async function fetchTodayActivities(): Promise<Activity[]> {
  return apiClient.get<Activity[]>('/activities/today');
}
