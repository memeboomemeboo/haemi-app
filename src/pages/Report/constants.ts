import { colors } from '@/shared/constants/tokens';
import type { ElderStatus } from '@/shared/types/report';

export type ReportTone = 'success' | 'warning' | 'danger' | 'primary';

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

export const ELDER_STATUS_MAP: Record<
  ElderStatus,
  { label: string; tone: Extract<ReportTone, 'success' | 'danger' | 'primary'> }
> = {
  GOOD: { label: '양호', tone: 'success' },
  NORMAL: { label: '보통', tone: 'primary' },
  WATCH: { label: '관찰 필요', tone: 'danger' },
};

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
