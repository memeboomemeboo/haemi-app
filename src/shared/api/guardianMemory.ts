import { get, post, put } from './client';
import type { SwaggerApiResponse } from '@/shared/types';
import type { GuardianRole } from './my-page';

export interface GuardianMemorySummary {
  id: string;
  elderId: string;
  title: string;
  thumbnailKey?: string;
  responded: boolean;
  place?: string;
  memoryYear: number;
  memoryMonth: number;
  creatorName: string;
  creatorRole: GuardianRole | 'ELDER';
  creatorRoleLabel: string;
  isMine: boolean;
}

export interface GuardianMemoryDetail {
  id: string;
  elderId: string;
  title: string;
  memo?: string;
  message: string;
  memoryYear: number;
  memoryMonth: number;
  place?: string;
  imageKeys: string[];
  responded: boolean;
  createdAt: string;
  creatorName: string;
  creatorRole: GuardianRole | 'ELDER';
  creatorRoleLabel: string;
  isMine: boolean;
}

export interface CreateGuardianMemoryRequest {
  elderId: string;
  title: string;
  memo?: string;
  message: string;
  memoryYear: number;
  memoryMonth: number;
  place?: string;
  mediaRefIds?: string[];
}

export interface UpdateGuardianMemoryRequest {
  title: string;
  memo?: string;
  message: string;
  memoryYear: number;
  memoryMonth: number;
  place?: string;
  mediaRefIds?: string[];
}

export const guardianMemoryService = {
  /** elderId를 지정하면 해당 어르신 추억만, 미지정 시 접근 가능한 전 어르신 추억을 통합('전체' 탭) 조회한다 */
  async getMemories(elderId?: string): Promise<GuardianMemorySummary[]> {
    const query = elderId ? `?elderId=${encodeURIComponent(elderId)}` : '';
    const response = await get<SwaggerApiResponse<GuardianMemorySummary[]>>(`/guardian/memories${query}`);
    return response.data;
  },

  async getMemoryDetail(memoryId: string): Promise<GuardianMemoryDetail> {
    const response = await get<SwaggerApiResponse<GuardianMemoryDetail>>(`/guardian/memories/${memoryId}`);
    return response.data;
  },

  async createMemory(data: CreateGuardianMemoryRequest): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>('/guardian/memories', data);
    return response.data;
  },

  /** 생성자 본인만 수정 가능 — 403 NOT_RESOURCE_OWNER, 404 존재하지 않는 추억 */
  async updateMemory(memoryId: string, data: UpdateGuardianMemoryRequest): Promise<void> {
    await put<SwaggerApiResponse<void>>(`/guardian/memories/${memoryId}`, data);
  },
};
