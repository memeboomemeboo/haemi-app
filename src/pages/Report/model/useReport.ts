import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getElderReportList } from '@/shared/api/report';
import { useAsyncData } from '@/shared/hooks';

export function useReport() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: elders, isLoading, isError, refetch } = useAsyncData(getElderReportList);

  const openReportDetail = useCallback(
    (elderId: string) => {
      router.push(`/report-detail?elderId=${elderId}`);
    },
    [router],
  );

  return {
    elders: elders ?? [],
    isLoading,
    isError,
    refetch,
    fixedTopPaddingTop: Math.max(insets.top, 20),
    openReportDetail,
  };
}
