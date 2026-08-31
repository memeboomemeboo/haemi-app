import { getElderHome } from '@/shared/api/elderHome';
import { useAsyncData } from '@/shared/hooks';

export function useElderHome() {
  const { data, isLoading, isError, refetch } = useAsyncData(getElderHome);

  return {
    homeData: data,
    isLoading,
    isError,
    refetch,
  };
}
