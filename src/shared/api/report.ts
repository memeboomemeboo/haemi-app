import type {
  CognitiveMetricResult,
  CognitiveReportPeriod,
  CognitiveReportResult,
  ReportDeliveryMethod,
} from '@/shared/types/report';

// 기본 API URL (환경변수)
export const REPORT_API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set');
}

export const REPORT_ACCESS_TOKEN = process.env.EXPO_PUBLIC_HAEMI_ACCESS_TOKEN;

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
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
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
  accessToken = REPORT_ACCESS_TOKEN,
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
  deliveryMethod,
  accessToken = REPORT_ACCESS_TOKEN,
}: {
  elderId: string;
  albumId?: string;
  period: CognitiveReportPeriod;
  deliveryMethod: ReportDeliveryMethod;
  accessToken?: string;
}) {
  return requestReport<CognitiveReportResult>('/api/v1/cognitive-dashboard/reports', {
    method: 'POST',
    accessToken,
    query: { elderId, albumId, period, deliveryMethod },
  });
}

export function markReportViewed({
  reportId,
  accessToken = REPORT_ACCESS_TOKEN,
}: {
  reportId: string;
  accessToken?: string;
}) {
  return requestReport<CognitiveReportResult>(`/api/v1/cognitive-dashboard/reports/${reportId}/viewed`, {
    method: 'POST',
    accessToken,
  });
}
