import { useAsyncData } from '@/shared/hooks';
import { fetchSeniorProfile } from '../api/userApi';

export function useSeniorProfile() {
  const { data: profile, isLoading, error, refetch } = useAsyncData(fetchSeniorProfile);
  return { profile, isLoading, error, refetch };
}
