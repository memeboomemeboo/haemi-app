import { colors } from '@/shared/constants/tokens';
import type { AreaStatus, CognitiveArea, ElderStatus, SuggestionAction } from '@/shared/types/report';

export type StatusTone = 'good' | 'caution' | 'watch';

export type AttendanceDay = {
  day: string;
  attended: boolean;
  color: string;
};

export type CognitiveStatus = {
  label: string;
  score: 1 | 2 | 3;
  tone: StatusTone;
  badge: string;
};

export type Highlight = {
  eyebrow: string;
  body: string;
  icon: 'picture' | 'pencil';
};

export type SupportGuide = {
  title: string;
  description: string;
};

export type ReportDetailProfile = {
  name: string;
  meta: string;
  badge: string;
  badgeColor: string;
  summary: string;
};

export type ReportDetailAttendanceCopy = {
  title: string;
  summary: string;
  note: string;
  streak: string;
};

const palette = colors.palette;
const light = colors.light;

export const REPORT_DETAIL_COLORS = {
  avatarBackground: '#fed7cd',
  avatarIcon: '#fd8768',
  primarySoft: '#fed7cd',
};

export const REPORT_DETAIL_SECTION_TITLES = {
  cognitive: '인지 영역별 상태',
  highlight: '이번 주 하이라이트',
  supportGuide: '서포트 가이드',
};

export const STATUS_COLORS: Record<StatusTone, string> = {
  good: palette.green[40],
  caution: palette.yellow[50],
  watch: palette.red[60],
};

export const ELDER_STATUS_BADGE: Record<ElderStatus, { label: string; color: string }> = {
  GOOD: { label: '양호', color: palette.green[40] },
  NORMAL: { label: '보통', color: light.line.neutral },
  WATCH: { label: '관찰 필요', color: palette.red[60] },
};

export const COGNITIVE_AREA_LABELS: Record<CognitiveArea, string> = {
  ORIENTATION: '상황 파악',
  RECALL: '기억 회상',
  LANGUAGE: '언어',
  DELAYED_RECALL: '지연 회상도',
};

export const AREA_STATUS_MAP: Record<
  AreaStatus,
  { score: 1 | 2 | 3; tone: StatusTone; badge: string }
> = {
  GOOD: { score: 3, tone: 'good', badge: '양호' },
  NORMAL: { score: 2, tone: 'caution', badge: '보통' },
  WATCH: { score: 1, tone: 'watch', badge: '관찰' },
  NOT_AVAILABLE: { score: 1, tone: 'caution', badge: '정보 없음' },
};

export const SUGGESTION_TITLES: Record<SuggestionAction, string> = {
  SEND_DAILY_CARE: '안부 인사 보내기',
  REGISTER_MEMORY: '추억 사진 등록하기',
  CALL_ELDER: '전화 드리기',
  PRAISE_ELDER: '칭찬 메시지 전하기',
};

export const DAY_SHORT_LABELS: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

export const DAY_COLORS: Record<string, string> = {
  SATURDAY: palette.blue[60],
  SUNDAY: colors.status.error,
};
