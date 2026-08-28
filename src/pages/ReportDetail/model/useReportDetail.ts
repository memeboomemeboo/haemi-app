import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ATTENDANCE,
  COGNITIVE_STATUS,
  HIGHLIGHTS,
  REPORT_DETAIL_ATTENDANCE,
  REPORT_DETAIL_HEADER,
  REPORT_DETAIL_PROFILE,
  SUPPORT_GUIDES,
} from '@/pages/ReportDetail/constants';

export function useReportDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    attendance: ATTENDANCE,
    attendanceCopy: REPORT_DETAIL_ATTENDANCE,
    cognitiveStatus: COGNITIVE_STATUS,
    contentPaddingBottom: Math.max(insets.bottom, 0) + 28,
    fixedTopPaddingTop: Math.max(insets.top, 20),
    goBack,
    header: REPORT_DETAIL_HEADER,
    highlights: HIGHLIGHTS,
    profile: REPORT_DETAIL_PROFILE,
    supportGuides: SUPPORT_GUIDES,
  };
}
