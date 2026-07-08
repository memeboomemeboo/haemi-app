export type CognitiveReportPeriod = 'WEEKLY' | 'MONTHLY';
export type ReportDeliveryMethod = 'IN_APP' | 'EMAIL' | 'IN_APP_AND_EMAIL';

export type CognitiveMetricResult = {
  elderId?: string;
  albumId?: string;
  institutionId?: string;
  metricDate?: string;
  trainingSessionCount?: number;
  trainingAccuracyRate?: number;
  averageResponseSeconds?: number;
  reminiscenceReactionCount?: number;
  memoryPostCount?: number;
  mostReactedPhotoType?: string;
};

export type CognitiveReportResult = {
  reportId?: string;
  elderId?: string;
  albumId?: string;
  period?: CognitiveReportPeriod;
  periodStart?: string;
  periodEnd?: string;
  participationCount?: number;
  averageAccuracyRate?: number;
  averageResponseSeconds?: number;
  memoryPostCount?: number;
  reminiscenceParticipationCount?: number;
  mostReactedPhotoType?: string;
  accuracyChangeFromPrevious?: number;
  responseTimeChangeFromPrevious?: number;
  accuracyTrend?: { date?: string; accuracyRate?: number }[];
  changeSummary?: string;
  deliveryMethod?: ReportDeliveryMethod;
  pdfKey?: string;
  viewedAt?: string;
  createdAt?: string;
};
