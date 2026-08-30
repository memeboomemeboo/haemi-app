import { useAsyncData } from '@/shared/hooks';
import { fetchElderProfile } from '../api/elderApi';

export function useElderProfile() {
  const { data: profile, isLoading, error, refetch } = useAsyncData(fetchElderProfile);
  return { profile, isLoading, error, refetch };
}
