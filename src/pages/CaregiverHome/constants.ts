import type { Href } from 'expo-router';

import { CALENDAR_XML, HEART_XML } from '@/pages/CaregiverHome/assets';
import { colors } from '@/shared/constants';
import type { GuardianCondition } from '@/shared/types/guardian-home';

export type ActivitySegment = {
  color: string;
  height: number;
};

export type WeeklyActivityDay = {
  label: string;
  color: string;
  segments: ActivitySegment[];
};

export type LegendItem = {
  label: string;
  color: string;
};

export type CaregiverTask = {
  label: string;
  accessibilityLabel: string;
  backgroundColor: string;
  iconXml: string;
  href: Href;
  /** 완료 여부를 challenge의 어느 필드에서 읽을지 */
  completionKey: 'greetingCompleted' | 'memoryCompleted';
};

export type CaregiverRecord = {
  title: string;
  /** 서버 occurredAt에서 포맷한 시각. API에 없으면 표시하지 않는다. */
  time: string;
  detail: string;
};

export const CAREGIVER_HOME_MAX_WIDTH = 402;

export const CAREGIVER_HOME_ROUTES = {
  familyMemories: '/family-memories',
  memoryRegister: '/memory-register',
} as const satisfies Record<string, Href>;

/** 화면에 고정으로 노출되는 문구 (동적 데이터는 훅에서 조합한다). */
export const CAREGIVER_HOME_COPY = {
  greetingSubtitle: '소중한 추억을 함께 만들어가요.',
  todoTitle: '오늘의 할일',
  recordTitle: '오늘의 기록',
  recordMore: '자세히 보기',
} as const;

/** 3색 컨디션 → 카드 제목·요약 라벨. 판정 데이터가 없으면 null 키를 쓴다. */
export const CONDITION_COPY: Record<GuardianCondition, { title: string; label: string }> = {
  GOOD: { title: '오늘 컨디션 좋아요', label: '양호' },
  CAUTION: { title: '오늘 컨디션 주의가 필요해요', label: '주의' },
  OBSERVE: { title: '오늘 관찰이 필요해요', label: '관찰' },
};

export const CONDITION_COPY_EMPTY = { title: '컨디션 정보가 아직 없어요', label: '-' } as const;

export const SEGMENT_COLORS = {
  answer: colors.status.error,
  album: colors.light.primary,
  word: colors.palette.red[70],
  training: colors.palette.orange[90],
} as const;

export const WEEKLY_ACTIVITY_LEGEND: LegendItem[] = [
  { label: '답변', color: SEGMENT_COLORS.answer },
  { label: '추억 열람', color: SEGMENT_COLORS.album },
  { label: '한마디 읽음', color: SEGMENT_COLORS.word },
  { label: '인지 훈련', color: SEGMENT_COLORS.training },
];

/** 주간 스택 막대에서 활동 종류별 세그먼트 높이(아래→위 순서로 쌓는다). */
export const SEGMENT_SPEC = [
  { key: 'training', color: SEGMENT_COLORS.training, height: 8 },
  { key: 'greetingRead', color: SEGMENT_COLORS.word, height: 8 },
  { key: 'memoryViewed', color: SEGMENT_COLORS.album, height: 9 },
  { key: 'replied', color: SEGMENT_COLORS.answer, height: 8 },
] as const;

/** 서버 DayOfWeek(MONDAY…) → 요일 한 글자 */
export const DAY_OF_WEEK_LABEL: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

/** 오늘 할 일 카드. 완료 상태(statusXml)는 challenge 응답에서 결정한다. */
export const CAREGIVER_TASKS: CaregiverTask[] = [
  {
    label: '오늘의 한마디',
    accessibilityLabel: '오늘의 한마디',
    backgroundColor: colors.palette.neutral[95],
    iconXml: HEART_XML,
    href: CAREGIVER_HOME_ROUTES.familyMemories,
    completionKey: 'greetingCompleted',
  },
  {
    label: '추억 등록',
    accessibilityLabel: '추억 등록',
    backgroundColor: colors.palette.orange[97],
    iconXml: CALENDAR_XML,
    href: CAREGIVER_HOME_ROUTES.memoryRegister,
    completionKey: 'memoryCompleted',
  },
];
