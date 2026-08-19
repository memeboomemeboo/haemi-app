import { useCallback, useEffect, useState } from 'react';

import { getAccessToken } from '@/shared/api/session';
import { generateReport, getHomeContext, getReportMetrics, markReportViewed, ReportApiError } from '@/shared/api/report';
import type { CognitiveMetricResult, CognitiveReportResult } from '@/shared/types/report';

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCurrentMonthRange() {
  const now = new Date();
  return {
    from: toDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toDateString(now),
  };
}

export function useReminiscenceReport() {
  const [report, setReport] = useState<CognitiveReportResult>();
  const [metrics, setMetrics] = useState<CognitiveMetricResult[]>([]);
  const [isConfigured, setIsConfigured] = useState<boolean>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [emptyReason, setEmptyReason] = useState<string>();

  const load = useCallback(async () => {
    const accessToken = await getAccessToken();
    setIsConfigured(Boolean(accessToken));
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setEmptyReason(undefined);
    const { from, to } = getCurrentMonthRange();

    try {
      const home = await getHomeContext(accessToken);
      if (!home?.elderId) throw new Error('연결된 어르신 정보를 찾을 수 없습니다.');

      const [reportResult, metricsResult] = await Promise.allSettled([
        generateReport({ elderId: home.elderId, period: 'MONTHLY', from, to, deliveryMethod: 'IN_APP', accessToken }),
        getReportMetrics({ elderId: home.elderId, from, to, accessToken }),
      ]);

      if (reportResult.status === 'fulfilled') {
        setReport(reportResult.value);
        if (reportResult.value?.reportId) {
          void markReportViewed({ reportId: reportResult.value.reportId, accessToken }).catch(() => undefined);
        }
      }

      if (metricsResult.status === 'fulfilled') setMetrics(metricsResult.value ?? []);
      if (reportResult.status === 'rejected' && metricsResult.status === 'rejected') {
        const reasons = [reportResult.reason, metricsResult.reason];
        const hasOnlyEmptyResponses = reasons.every((reason) =>
          reason instanceof ReportApiError && (reason.status === 404 || reason.status === 409));

        if (hasOnlyEmptyResponses) {
          setEmptyReason('아직 리포트를 만들 수 있는 회상 기록이 충분하지 않습니다.');
        } else {
          throw reportResult.reason;
        }
      }
    } catch (reason) {
      if (reason instanceof ReportApiError && reason.status === 404) {
        setEmptyReason('연결된 어르신 또는 회상 기록이 없습니다.');
      } else if (reason instanceof ReportApiError && (reason.status === 401 || reason.status === 403)) {
        setError(new Error('로그인 세션이 만료되었거나 리포트 조회 권한이 없습니다. 다시 로그인해 주세요.'));
      } else {
        setError(reason instanceof Error ? reason : new Error('회상 리포트를 불러오지 못했습니다.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return { report, metrics, isConfigured, isLoading, error, emptyReason, refetch: load };
}
