export type CognitiveReportPeriod = 'WEEKLY' | 'MONTHLY';
export type ReportDeliveryMethod = 'IN_APP' | 'EMAIL' | 'IN_APP_AND_EMAIL';
export type CognitiveReportMode = 'STANDARD' | 'MEMORY_FOCUSED';

export type HomeContextResult = {
  memberId?: string;
  role?: 'FAMILY' | 'ELDER' | 'INSTITUTION_ADMIN';
  groupId?: string;
  elderId?: string;
  accessMode?: 'UNSET' | 'A' | 'B';
  elderStatus?: 'ACTIVE' | 'DECLINING' | 'HOSPITALIZED' | 'DORMANT' | 'DECEASED' | 'MEMORIAL';
};

export type CognitiveMetricResult = {
  elderId?: string;
  metricDate?: string;
  sessionCount?: number;
  voiceDetectedCount?: number;
  averageDwellMs?: number;
  hintPlaybackCount?: number;
  hintNoResponseCount?: number;
  familyContributionCount?: number;
  topMemoryTopic?: string;
  topDwelledPhoto?: string;
};

export type CognitiveReportResult = {
  reportId?: string;
  elderId?: string;
  period?: CognitiveReportPeriod;
  mode?: CognitiveReportMode;
  periodStart?: string;
  periodEnd?: string;
  daysTogether?: number;
  rememberedTopics?: string[];
  topDwelledPhotos?: string[];
  voiceResponseCount?: number;
  familyContributionCount?: number;
  activityMessage?: string;
  summary?: string;
  medicalDisclaimer?: string;
  pdfKey?: string;
  createdAt?: string;
};
