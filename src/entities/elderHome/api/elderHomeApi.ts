import { apiClient } from '@/shared/api';
import type { ElderHomeSummary } from '../model/types';
import { MOCK_ELDER_HOME_SUMMARY } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = true;

export async function fetchElderHomeSummary(): Promise<ElderHomeSummary> {
  if (USE_MOCK) {
    return MOCK_ELDER_HOME_SUMMARY;
  }
  return apiClient.get<ElderHomeSummary>('/elder/home-summary');
}
