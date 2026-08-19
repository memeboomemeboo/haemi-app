export interface HomeContext {
  memberId: string;
  role: 'FAMILY' | 'ELDER' | 'INSTITUTION_ADMIN';
  groupId?: string;
  /** 서버가 제공하는 경우 오늘의 회상 조회에 사용 */
  albumId?: string;
  elderId?: string;
  accessMode?: 'UNSET' | 'A' | 'B';
  elderStatus?: 'ACTIVE' | 'DECLINING' | 'HOSPITALIZED' | 'DORMANT' | 'DECEASED' | 'MEMORIAL';
}

export interface HomeMemory {
  memoryId: string;
  authorName?: string;
  authorRelation?: string;
  textContent?: string;
  createdAt?: string;
  media?: { mediaId: string; type: 'IMAGE' | 'AUDIO'; accessUrl?: string; displayOrder?: number }[];
}

export interface HomeMetric {
  metricDate?: string;
  sessionCount?: number;
  voiceDetectedCount?: number;
  averageDwellMs?: number;
  familyContributionCount?: number;
}

export interface ReminiscenceCard {
  photoId: string;
  sequence: number;
  cardType: 'STORY_CARD' | 'PERSON_CARD' | 'PLACE_CARD';
  promptText?: string;
}

export interface TodayReminiscence {
  contentId: string;
  albumId: string;
  generatedDate?: string;
  generatedAt?: string;
  cards?: ReminiscenceCard[];
  elderReaction?: 'LIKE' | 'HAPPY' | 'SAD' | 'SURPRISED' | 'NOSTALGIC';
}

export interface HomeData {
  userName: string;
  elderName: string;
  connectionDays: number;
  memories: HomeMemory[];
  todayMemoryCount: number;
  weeklyConversationMinutes: number;
  metrics: HomeMetric[];
  todayReminiscence: TodayReminiscence | null;
}
