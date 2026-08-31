import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { REPORTS } from '@/pages/Report/constants';

export function useReport() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openReportDetail = useCallback(() => {
    router.push('/report-detail');
  }, [router]);

  return {
    reports: REPORTS,
    fixedTopPaddingTop: Math.max(insets.top, 20),
    openReportDetail,
  };
}
