import type { Href } from 'expo-router';

import { CALENDAR_XML, CIRCLE_CHECK_XML, CIRCLE_EMPTY_XML, HEART_XML } from '@/pages/CaregiverHome/assets';

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
  statusXml: string;
  href: Href;
};

export type CaregiverRecord = {
  title: string;
  time: string;
  detail: string;
};

export const CAREGIVER_HOME_MAX_WIDTH = 402;

export const CAREGIVER_HOME_ROUTES = {
  familyMemories: '/family-memories',
  memoryRegister: '/memory-register',
} as const satisfies Record<string, Href>;

export const CAREGIVER_HOME_COPY = {
  greetingTitle: '승아님, 안녕하세요',
  greetingSubtitle: '어머니와의 소중한 추억을 함께 만들어가요.',
  conditionTitle: '오늘 컨디션 좋아요',
  conditionMeta: '마지막 접속 1시간 전',
  conditionLabel: '양호',
  todoTitle: '오늘의 할일',
  recordTitle: '오늘의 기록',
  recordMore: '자세히 보기',
} as const;

export const CAREGIVER_PATIENTS = ['박영호 님', '이순자 님'] as const;

export type CaregiverPatient = (typeof CAREGIVER_PATIENTS)[number];

export const CAREGIVER_COLORS = {
  orange: '#fd6941',
  orangeDeep: '#fd6035',
  orangeSoft: '#fff3f0',
  orangeLine: '#fed7cd',
  text: '#3c3e3f',
  textMuted: '#5a5c5d',
  textAssistive: '#76787a',
  lineNormal: '#c1c2c3',
  fill: '#f7f7f7',
  error: '#ee2a2b',
  blue: '#38a9fa',
  white: '#ffffff',
} as const;

export const SEGMENT_COLORS = {
  answer: CAREGIVER_COLORS.error,
  album: CAREGIVER_COLORS.orange,
  word: '#fd8768',
  training: CAREGIVER_COLORS.orangeLine,
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
    color: CAREGIVER_COLORS.error,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 9 },
      { color: SEGMENT_COLORS.album, height: 9 },
      { color: SEGMENT_COLORS.answer, height: 8 },
    ],
  },
  {
    label: '월',
    color: CAREGIVER_COLORS.lineNormal,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 8 },
      { color: SEGMENT_COLORS.album, height: 7 },
    ],
  },
  {
    label: '화',
    color: CAREGIVER_COLORS.lineNormal,
    segments: [{ color: SEGMENT_COLORS.training, height: 4 }],
  },
  {
    label: '수',
    color: CAREGIVER_COLORS.lineNormal,
    segments: [{ color: SEGMENT_COLORS.training, height: 4 }],
  },
  {
    label: '목',
    color: CAREGIVER_COLORS.lineNormal,
    segments: [
      { color: SEGMENT_COLORS.training, height: 7 },
      { color: SEGMENT_COLORS.word, height: 5 },
    ],
  },
  {
    label: '금',
    color: CAREGIVER_COLORS.lineNormal,
    segments: [
      { color: SEGMENT_COLORS.training, height: 7 },
      { color: SEGMENT_COLORS.word, height: 5 },
    ],
  },
  {
    label: '토',
    color: CAREGIVER_COLORS.blue,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 8 },
      { color: SEGMENT_COLORS.album, height: 7 },
    ],
  },
];

export const CAREGIVER_RECORDS: CaregiverRecord[] = [
  {
    title: '인지 활동 완료',
    time: '오전 9:20',
    detail: '기억력 게임 5분 · 정답률 80%',
  },
  {
    title: '음성 메세지 도착',
    time: '오전 11:05',
    detail: '“밥 잘 먹었다"',
  },
  {
    title: '추억 앨범 확인',
    time: '오후 2:40',
    detail: '올려주신 사진 3장을 보셨어요',
  },
];

export const CAREGIVER_TASKS: CaregiverTask[] = [
  {
    label: '오늘의 한마디',
    accessibilityLabel: '오늘의 한마디',
    backgroundColor: '#f5f5f5',
    iconXml: HEART_XML,
    statusXml: CIRCLE_EMPTY_XML,
    href: CAREGIVER_HOME_ROUTES.familyMemories,
  },
  {
    label: '추억 등록',
    accessibilityLabel: '추억 등록',
    backgroundColor: CAREGIVER_COLORS.orangeSoft,
    iconXml: CALENDAR_XML,
    statusXml: CIRCLE_CHECK_XML,
    href: CAREGIVER_HOME_ROUTES.memoryRegister,
  },
];
