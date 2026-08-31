/**
 * 보호자 홈 화면 관련 타입 (서버 계약: /api/v1/guardian/home, /guardian/elders/{id}/activities)
 */

export type GuardianRole =
  | 'DAUGHTER'
  | 'SON'
  | 'GRANDDAUGHTER'
  | 'GRANDSON'
  | string;

/** 홈 카드 3색 컨디션 (판정 데이터 없으면 null) */
export type GuardianCondition = 'GOOD' | 'CAUTION' | 'OBSERVE';

export interface DayActivity {
  /** YYYY-MM-DD */
  date: string;
  /** MONDAY ~ SUNDAY */
  dayOfWeek: string;
  training: boolean;
  greetingRead: boolean;
  memoryViewed: boolean;
  replied: boolean;
}

export interface GuardianHomeElderCard {
  elderId: string;
  name: string;
  age: number | null;
  role: GuardianRole;
  roleLabel: string;
  daysTogether: number;
  attendedToday: boolean;
  greetingSentToday: boolean;
  /** 마지막 로그인 시각(ISO). 접속 기록 없으면 null */
  lastLoginAt: string | null;
  /** 판정 데이터가 없으면 null */
  condition: GuardianCondition | null;
  /** 과거 → 오늘 순 7일 */
  weeklyActivities: DayActivity[];
}

export interface GuardianChallenge {
  greetingCompleted: boolean;
  memoryCompleted: boolean;
}

export interface GuardianHome {
  elders: GuardianHomeElderCard[];
  challenge: GuardianChallenge;
}

/** 오늘의 기록 타임라인 활동 종류 */
export type ActivityType =
  | 'TRAINING_COMPLETED'
  | 'GREETING_ARRIVED'
  | 'GREETING_READ'
  | 'MEMORY_VIEWED'
  | 'RESPONSE_SENT';

export interface ActivityItem {
  /** 활동 발생 시각(ISO) */
  occurredAt: string;
  type: ActivityType;
  title: string;
  /** 활동별 상세 정보 (종류마다 키가 다름) */
  detail: Record<string, unknown>;
}

export interface TodayActivities {
  /** YYYY-MM-DD */
  date: string;
  items: ActivityItem[];
}
