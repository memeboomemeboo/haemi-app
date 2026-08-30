import { colors } from '@/shared/constants/tokens';

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

export const REPORT_DETAIL_HEADER = {
  title: '박영호님 리포트',
  period: '9월 2주차',
};

export const REPORT_DETAIL_SECTION_TITLES = {
  cognitive: '인지 영역별 상태',
  highlight: '이번 주 하이라이트',
  supportGuide: '서포트 가이드',
};

export const REPORT_DETAIL_PROFILE: ReportDetailProfile = {
  name: '박영호 님',
  meta: '85세 · 함께한 지 96일',
  badge: '관찰 필요',
  summary:
    '이번 주 참여가 지난주보다 줄었어요. 지연 회상 활동에서 어려움이 관찰됐어요. 아래 가이드를 참고하세요.',
};

export const REPORT_DETAIL_ATTENDANCE: ReportDetailAttendanceCopy = {
  title: '출석 · 참여',
  summary: '일주일 중 5일 출석',
  note: '※ 지난 주보다 1일 적어요',
  streak: '3일 연속',
};

export const ATTENDANCE: AttendanceDay[] = [
  { day: '일', attended: true, color: colors.status.error },
  { day: '월', attended: true, color: light.label.alternative },
  { day: '화', attended: true, color: light.label.alternative },
  { day: '수', attended: false, color: light.label.alternative },
  { day: '목', attended: true, color: light.label.alternative },
  { day: '금', attended: true, color: light.label.alternative },
  { day: '토', attended: false, color: palette.blue[60] },
];

export const COGNITIVE_STATUS: CognitiveStatus[] = [
  { label: '상황 파악', score: 3, tone: 'good', badge: '양호' },
  { label: '기억 회상', score: 2, tone: 'caution', badge: '주의' },
  { label: '언어', score: 3, tone: 'good', badge: '양호' },
  { label: '지연 회상도', score: 1, tone: 'watch', badge: '관찰' },
];

export const HIGHLIGHTS: Highlight[] = [
  {
    eyebrow: '추억 회상에 좋은 반응',
    body: '고향 사진을 보고 이야기를 활발히 들려주셨어요.',
    icon: 'picture',
  },
  {
    eyebrow: '지연 회상 어려움',
    body: '조금 전 들은 단어를 떠올리는 활동을\n어려워하셨어요.',
    icon: 'pencil',
  },
];

export const SUPPORT_GUIDES: SupportGuide[] = [
  {
    title: '함께 옛날 사진 보기',
    description: '추억 앨범을 함께 넘기며 그때 이야기를 여쭤봐 주세요.',
  },
  {
    title: '짧게 자주 대화하기',
    description: '하루 한마디로 오늘 있었던 일을 여쭤보면 좋아요.',
  },
  {
    title: '지연 회상 돕기',
    description: '방금 나눈 이야기를 잠시 뒤 다시 여쭤보며 자연스럽게 연습해요.',
  },
];

export const STATUS_COLORS: Record<StatusTone, string> = {
  good: palette.green[40],
  caution: palette.yellow[50],
  watch: palette.red[60],
};
