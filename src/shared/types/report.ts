export type ElderStatus = 'GOOD' | 'NORMAL' | 'WATCH';
export type CognitiveArea = 'ORIENTATION' | 'RECALL' | 'LANGUAGE' | 'DELAYED_RECALL';
export type AreaStatus = 'GOOD' | 'NORMAL' | 'WATCH' | 'NOT_AVAILABLE';
export type SuggestionAction =
  | 'SEND_DAILY_CARE'
  | 'REGISTER_MEMORY'
  | 'CALL_ELDER'
  | 'PRAISE_ELDER';

export interface ElderReportCard {
  elderId: string;
  name: string;
  role: string;
  roleLabel: string;
  age: number;
  attendedToday: boolean;
  status: ElderStatus;
}

export interface ElderReportSummary {
  elderId: string;
  name: string;
  age: number;
  generation: string;
  daysTogether: number;
  attendedToday: boolean;
  weeklyParticipationDays: number;
  weeklyGoalDays: number;
  status: ElderStatus;
  currentStreak: number;
  bestStreak: number;
}

export interface DayMark {
  date: string;
  dayOfWeek: string;
  participated: boolean;
  training: boolean;
  greetingRead: boolean;
  memoryViewed: boolean;
  replied: boolean;
}

export interface AttendanceDetail {
  last7Days: DayMark[];
  currentStreak: number;
  bestStreak: number;
  weeklyStatus: ElderStatus;
}

export interface AreaStatusItem {
  area: CognitiveArea;
  status: AreaStatus;
  fourWeekDecline: boolean;
}

export interface CognitiveStatusData {
  elderId: string;
  areas: AreaStatusItem[];
}

export interface HighlightItem {
  id: string;
  title: string;
  body: string;
}

export interface WeeklyHighlight {
  elderId: string;
  items: HighlightItem[];
}

export interface SuggestionItem {
  action: SuggestionAction;
  message: string;
}

export interface SupportGuideData {
  elderName: string;
  suggestions: SuggestionItem[];
}
