import { get, post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

export interface ElderMemorySummary {
  id: string;
  title: string;
  message: string;
  memoryYear: number;
  imageKeys: string[];
  responded: boolean;
  createdAt: string;
  creatorName: string;
  creatorRole: string;
  creatorRoleLabel: string;
}

export interface ElderMemoryDetail extends ElderMemorySummary {
  memo?: string;
}

export const elderMemoryService = {
  /** 어르신 본인에게 등록된 추억 목록 */
  async getMemories(): Promise<ElderMemorySummary[]> {
    const response = await get<SwaggerApiResponse<ElderMemorySummary[]>>('/elder/memories');
    return response.data;
  },

  /** 추억 상세 조회 */
  async getMemoryDetail(memoryId: string): Promise<ElderMemoryDetail> {
    const response = await get<SwaggerApiResponse<ElderMemoryDetail>>(`/elder/memories/${memoryId}`);
    return response.data;
  },

  /** 어르신이 추억을 열어봤음을 기록 (최초 1회만 MemoryViewed 이벤트 발행) */
  async markMemoryViewed(memoryId: string): Promise<void> {
    await post<SwaggerApiResponse<string>>(`/elder/memories/${memoryId}/viewed`);
  },
};
