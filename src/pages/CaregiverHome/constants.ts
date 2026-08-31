import type { Href } from 'expo-router';

import { CALENDAR_XML, HEART_XML } from '@/pages/CaregiverHome/assets';
import { colors } from '@/shared/constants';

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
  completionKey: 'greetingCompleted' | 'memoryCompleted';
  href: Href;
};

export const CAREGIVER_HOME_MAX_WIDTH = 402;

export const CAREGIVER_HOME_ROUTES = {
  familyMemories: '/family-memories',
  memoryRegister: '/memory-register',
} as const satisfies Record<string, Href>;

export const CAREGIVER_HOME_COPY = {
  conditionTitle: '오늘 컨디션 좋아요',
  conditionMeta: '마지막 접속 1시간 전',
  conditionLabel: '양호',
  todoTitle: '오늘의 할일',
  recordTitle: '오늘의 기록',
  recordMore: '자세히 보기',
} as const;

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

export const WEEKLY_ACTIVITY_DAYS: WeeklyActivityDay[] = [
  {
    label: '일',
    color: colors.status.error,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 9 },
      { color: SEGMENT_COLORS.album, height: 9 },
      { color: SEGMENT_COLORS.answer, height: 8 },
    ],
  },
  {
    label: '월',
    color: colors.light.line.normal,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 8 },
      { color: SEGMENT_COLORS.album, height: 7 },
    ],
  },
  {
    label: '화',
    color: colors.light.line.normal,
    segments: [{ color: SEGMENT_COLORS.training, height: 4 }],
  },
  {
    label: '수',
    color: colors.light.line.normal,
    segments: [{ color: SEGMENT_COLORS.training, height: 4 }],
  },
  {
    label: '목',
    color: colors.light.line.normal,
    segments: [
      { color: SEGMENT_COLORS.training, height: 7 },
      { color: SEGMENT_COLORS.word, height: 5 },
    ],
  },
  {
    label: '금',
    color: colors.light.line.normal,
    segments: [
      { color: SEGMENT_COLORS.training, height: 7 },
      { color: SEGMENT_COLORS.word, height: 5 },
    ],
  },
  {
    label: '토',
    color: colors.palette.blue[60],
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 8 },
      { color: SEGMENT_COLORS.album, height: 7 },
    ],
  },
];

export const CAREGIVER_TASKS: CaregiverTask[] = [
  {
    label: '오늘의 한마디',
    accessibilityLabel: '오늘의 한마디',
    backgroundColor: colors.palette.neutral[95],
    iconXml: HEART_XML,
    completionKey: 'greetingCompleted',
    href: CAREGIVER_HOME_ROUTES.familyMemories,
  },
  {
    label: '추억 등록',
    accessibilityLabel: '추억 등록',
    backgroundColor: colors.palette.orange[97],
    iconXml: CALENDAR_XML,
    completionKey: 'memoryCompleted',
    href: CAREGIVER_HOME_ROUTES.memoryRegister,
  },
];
