import { useAsyncData } from '@/shared/hooks';
import { fetchTodayActivities } from '../api/activityApi';

export function useTodayActivities() {
  const { data: activities, isLoading, error, refetch } = useAsyncData(fetchTodayActivities);
  return { activities, isLoading, error, refetch };
}
