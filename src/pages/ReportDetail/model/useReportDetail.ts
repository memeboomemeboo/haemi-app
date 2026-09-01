import { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getAttendanceDetail,
  getCognitiveStatus,
  getElderReportSummary,
  getSupportGuide,
  getWeeklyHighlight,
} from '@/shared/api/report';
import { useAndroidBackHandler, useAsyncData } from '@/shared/hooks';
import { colors } from '@/shared/constants/tokens';
import {
  AREA_STATUS_MAP,
  COGNITIVE_AREA_LABELS,
  DAY_COLORS,
  DAY_SHORT_LABELS,
  ELDER_STATUS_BADGE,
  SUGGESTION_TITLES,
  type AttendanceDay,
  type CognitiveStatus,
  type Highlight,
  type ReportDetailAttendanceCopy,
  type ReportDetailProfile,
  type SupportGuide,
} from '@/pages/ReportDetail/constants';
import type { CognitiveArea } from '@/shared/types/report';

const light = colors.light;

const COGNITIVE_AREA_ORDER: CognitiveArea[] = [
  'ORIENTATION',
  'RECALL',
  'LANGUAGE',
  'DELAYED_RECALL',
];

export function useReportDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { elderId } = useLocalSearchParams<{ elderId: string }>();

  const fetchAll = useCallback(async () => {
    if (!elderId) throw new Error('elderId is required');
    const [summary, attendance, cognitive, highlight, supportGuide] = await Promise.all([
      getElderReportSummary(elderId),
      getAttendanceDetail(elderId),
      getCognitiveStatus(elderId),
      getWeeklyHighlight(elderId),
      getSupportGuide(elderId),
    ]);
    return { summary, attendance, cognitive, highlight, supportGuide };
  }, [elderId]);

  const { data, isLoading, isError } = useAsyncData(fetchAll);

  const goBack = useCallback(() => router.back(), [router]);

  useAndroidBackHandler(
    useCallback(() => {
      router.replace('/report');
      return true;
    }, [router]),
  );

  const layout = {
    contentPaddingBottom: Math.max(insets.bottom, 0) + 28,
    fixedTopPaddingTop: Math.max(insets.top, 20),
    goBack,
  };

  if (!data) {
    return {
      ...layout,
      isLoading,
      isError,
      attendance: [] as AttendanceDay[],
      attendanceCopy: null as ReportDetailAttendanceCopy | null,
      cognitiveStatus: [] as CognitiveStatus[],
      header: { title: '리포트', period: '이번 주' },
      highlights: [] as Highlight[],
      profile: null as ReportDetailProfile | null,
      supportGuides: [] as SupportGuide[],
    };
  }

  const { summary, attendance, cognitive, highlight, supportGuide } = data;

  // 프로필
  const elderStatusBadge = ELDER_STATUS_BADGE[summary.status];
  const profile: ReportDetailProfile = {
    name: `${summary.name} 님`,
    meta: `${summary.age}세 · 함께한 지 ${summary.daysTogether}일`,
    badge: elderStatusBadge.label,
    badgeColor: elderStatusBadge.color,
    summary: `이번 주 ${summary.weeklyGoalDays}일 중 ${summary.weeklyParticipationDays}일 참여했어요. 현재 ${summary.currentStreak}일 연속 참여 중이에요.`,
  };

  // 헤더
  const header = { title: `${summary.name}님 리포트`, period: '이번 주' };

  // 출석
  const attendanceDays: AttendanceDay[] = attendance.last7Days.map((day) => ({
    day: DAY_SHORT_LABELS[day.dayOfWeek] ?? day.dayOfWeek,
    attended: day.participated,
    color: DAY_COLORS[day.dayOfWeek] ?? light.label.alternative,
  }));

  const participatedCount = attendance.last7Days.filter((d) => d.participated).length;
  const attendanceCopy: ReportDetailAttendanceCopy = {
    title: '출석 · 참여',
    summary: `일주일 중 ${participatedCount}일 출석`,
    note: `※ 최고 연속 참여: ${attendance.bestStreak}일`,
    streak: `${attendance.currentStreak}일 연속`,
  };

  // 인지 영역
  const areaMap = new Map(cognitive.areas.map((a) => [a.area, a]));
  const cognitiveStatus: CognitiveStatus[] = COGNITIVE_AREA_ORDER.map((area) => {
    const item = areaMap.get(area);
    const mapped = AREA_STATUS_MAP[item?.status ?? 'NOT_AVAILABLE'];
    return {
      label: COGNITIVE_AREA_LABELS[area],
      score: mapped.score,
      tone: mapped.tone,
      badge: mapped.badge,
    };
  });

  // 하이라이트
  const highlights: Highlight[] = highlight.items.map((item) => ({
    eyebrow: item.title,
    body: item.body,
    icon: 'pencil',
  }));

  // 서포트 가이드
  const supportGuides: SupportGuide[] = supportGuide.suggestions.map((s) => ({
    title: SUGGESTION_TITLES[s.action] ?? s.action,
    description: s.message,
  }));

  return {
    ...layout,
    isLoading,
    isError,
    attendance: attendanceDays,
    attendanceCopy,
    cognitiveStatus,
    header,
    highlights,
    profile,
    supportGuides,
  };
}
