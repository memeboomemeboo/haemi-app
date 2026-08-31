import { get } from './client';
import type { SwaggerApiResponse } from '@/shared/types';
import type { GuardianHome, TodayActivities } from '@/shared/types/guardian-home';

/** 보호자 홈 화면 조합 (어르신 카드 목록 + 오늘의 챌린지) */
export async function getGuardianHome(): Promise<GuardianHome> {
  const res = await get<SwaggerApiResponse<GuardianHome>>('/guardian/home');
  return res.data;
}

/**
 * 선택한 어르신의 오늘의 기록 타임라인.
 * date 미지정이면 서버가 오늘(KST)로 처리한다.
 */
export async function getElderActivities(
  elderId: string,
  date?: string,
): Promise<TodayActivities> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await get<SwaggerApiResponse<TodayActivities>>(
    `/guardian/elders/${elderId}/activities${query}`,
  );
  return res.data;
}
