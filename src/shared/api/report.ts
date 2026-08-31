import { get } from './client';
import type { SwaggerApiResponse } from '@/shared/types';
import type {
  AttendanceDetail,
  CognitiveStatusData,
  ElderReportCard,
  ElderReportSummary,
  SupportGuideData,
  WeeklyHighlight,
} from '@/shared/types/report';

export async function getElderReportList(): Promise<ElderReportCard[]> {
  const res = await get<SwaggerApiResponse<ElderReportCard[]>>('/guardian/report/elders');
  return res.data;
}

export async function getElderReportSummary(elderId: string): Promise<ElderReportSummary> {
  const res = await get<SwaggerApiResponse<ElderReportSummary>>(
    `/guardian/elders/${elderId}/report/summary`,
  );
  return res.data;
}

export async function getAttendanceDetail(elderId: string): Promise<AttendanceDetail> {
  const res = await get<SwaggerApiResponse<AttendanceDetail>>(
    `/guardian/elders/${elderId}/report/attendance`,
  );
  return res.data;
}

export async function getCognitiveStatus(elderId: string): Promise<CognitiveStatusData> {
  const res = await get<SwaggerApiResponse<CognitiveStatusData>>(
    `/guardian/elders/${elderId}/report/cognitive-status`,
  );
  return res.data;
}

export async function getWeeklyHighlight(elderId: string): Promise<WeeklyHighlight> {
  const res = await get<SwaggerApiResponse<WeeklyHighlight>>(
    `/guardian/elders/${elderId}/report/highlight`,
  );
  return res.data;
}

export async function getSupportGuide(elderId: string): Promise<SupportGuideData> {
  const res = await get<SwaggerApiResponse<SupportGuideData>>(
    `/guardian/elders/${elderId}/report/support-guide`,
  );
  return res.data;
}
