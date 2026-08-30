import { useAsyncData } from '@/shared/hooks';
import { fetchElderHomeSummary } from '../api/elderHomeApi';

export function useElderHomeSummary() {
  const { data: summary, isLoading, error, refetch } = useAsyncData(fetchElderHomeSummary);
  return { summary, isLoading, error, refetch };
}
