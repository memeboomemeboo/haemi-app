import type {
  CognitiveMetricResult,
  HomeContextResult,
  CognitiveReportPeriod,
  CognitiveReportResult,
  ReportDeliveryMethod,
} from '@/shared/types/report';
import { getAccessToken } from '@/shared/api/session';

const DEFAULT_API_BASE_URL = 'http://54.180.61.149:8080';

export const REPORT_API_BASE_URL =
  process.env.EXPO_PUBLIC_HAEMI_API_BASE_URL ?? DEFAULT_API_BASE_URL;

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export class ReportApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ReportApiError';
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  accessToken?: string;
  query?: Record<string, string | undefined>;
};

async function requestReport<T>(path: string, { accessToken, query, headers, ...init }: RequestOptions = {}) {
  const url = new URL(path, REPORT_API_BASE_URL);
  const resolvedAccessToken = accessToken ?? await getAccessToken();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : undefined),
      ...(resolvedAccessToken ? { Authorization: `Bearer ${resolvedAccessToken}` } : undefined),
      ...headers,
    },
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as ApiResponse<T>) : undefined;

  if (!response.ok) {
    throw new ReportApiError(response.status, body?.message ?? `리포트 API 요청에 실패했습니다. (${response.status})`);
  }

  return body?.data as T;
}

export function getReportMetrics({
  elderId,
  from,
  to,
  accessToken,
}: {
  elderId: string;
  from: string;
  to: string;
  accessToken?: string;
}) {
  return requestReport<CognitiveMetricResult[]>('/api/v1/cognitive-dashboard/metrics', {
    accessToken,
    query: { elderId, from, to },
  });
}

export function generateReport({
  elderId,
  albumId,
  period,
  from,
  to,
  deliveryMethod,
  accessToken,
}: {
  elderId: string;
  albumId?: string;
  period: CognitiveReportPeriod;
  from?: string;
  to?: string;
  deliveryMethod: ReportDeliveryMethod;
  accessToken?: string;
}) {
  return requestReport<CognitiveReportResult>('/api/v1/cognitive-dashboard/reports', {
    method: 'POST',
    accessToken,
    query: { elderId, albumId, period, from, to, deliveryMethod },
  });
}

export function getHomeContext(accessToken?: string) {
  return requestReport<HomeContextResult>('/api/v1/home', { accessToken });
}

export function getReportPdfUrl(reportId: string) {
  return new URL(`/api/v1/cognitive-dashboard/reports/${reportId}/pdf`, REPORT_API_BASE_URL).toString();
}

export function markReportViewed({
  reportId,
  accessToken,
}: {
  reportId: string;
  accessToken?: string;
}) {
  return requestReport<CognitiveReportResult>(`/api/v1/cognitive-dashboard/reports/${reportId}/viewed`, {
    method: 'POST',
    accessToken,
  });
}
