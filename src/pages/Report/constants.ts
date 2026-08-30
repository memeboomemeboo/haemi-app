import { colors } from '@/shared/constants/tokens';

export type ReportTone = 'success' | 'warning' | 'danger' | 'primary';

export type WeeklyReportTag = {
  label: string;
  tone: ReportTone;
};

export type WeeklyReportMetric = {
  value: string;
  label: string;
  tone: Extract<ReportTone, 'success' | 'danger'> | 'info';
};

export type WeeklyReport = {
  id: string;
  name: string;
  period: string;
  type: string;
  status: {
    label: string;
    tone: Extract<ReportTone, 'success' | 'danger'>;
  };
  tags: WeeklyReportTag[];
  summary: string;
  metrics: WeeklyReportMetric[];
};

const palette = colors.palette;
const light = colors.light;

export const REPORT_COPY = {
  title: '리포트',
  caption: '※관찰이 필요한 순으로 매주 월요일마다 정렬돼요.',
  detailButton: '자세히 보기',
};

export const REPORT_COLORS = {
  avatarBackground: '#fed7cd',
  avatarIcon: '#fd8768',
  primarySoft: '#fed7cd',
};

export const REPORTS: WeeklyReport[] = [
  {
    id: 'watch-needed',
    name: '박영호 님',
    period: '9월 2주차',
    type: '주간 요약',
    status: {
      label: '관찰 필요',
      tone: 'danger',
    },
    tags: [
      { label: '지남력', tone: 'success' },
      { label: '회상', tone: 'warning' },
      { label: '언어', tone: 'success' },
      { label: '지연회상', tone: 'primary' },
    ],
    summary: '이번 주 참여가 지난주보다 줄었어요. 지연 회상 활동에서 어려움이 관찰됩니다.',
    metrics: [
      { value: '5 / 7', label: '이번 주 출석', tone: 'danger' },
      { value: '4일', label: '연속 참여', tone: 'info' },
      { value: '월 12회', label: '활동 참여', tone: 'success' },
    ],
  },
  {
    id: 'stable',
    name: '박영호 님',
    period: '9월 2주차',
    type: '주간 요약',
    status: {
      label: '양호',
      tone: 'success',
    },
    tags: [
      { label: '지남력', tone: 'success' },
      { label: '회상', tone: 'success' },
      { label: '언어', tone: 'success' },
      { label: '지연회상', tone: 'warning' },
    ],
    summary: '꾸준히 참여하고 있어요. 모든 인지 영역이 안정적으로 유지되고 있습니다.',
    metrics: [
      { value: '5 / 7', label: '이번 주 출석', tone: 'danger' },
      { value: '4일', label: '연속 참여', tone: 'info' },
      { value: '12회', label: '활동 참여', tone: 'success' },
    ],
  },
];

export const REPORT_TONE_STYLES: Record<ReportTone, { backgroundColor: string; color: string }> = {
  success: {
    backgroundColor: palette.green[40],
    color: light.background.normal,
  },
  warning: {
    backgroundColor: palette.yellow[90],
    color: palette.yellow[30],
  },
  danger: {
    backgroundColor: palette.red[60],
    color: light.background.normal,
  },
  primary: {
    backgroundColor: REPORT_COLORS.primarySoft,
    color: light.primary,
  },
};

export const REPORT_METRIC_COLORS: Record<WeeklyReportMetric['tone'], string> = {
  danger: palette.red[70],
  info: palette.blue[70],
  success: palette.green[40],
};
