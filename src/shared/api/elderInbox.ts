import { get, post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';
import type { DailyCareType } from './guardianDailyCare';

export interface ElderInboxItem {
  id: string;
  guardianId: string;
  type: DailyCareType;
  text?: string;
  mediaKey?: string;
  durationSeconds?: number;
  guardianName?: string;
  guardianRoleLabel?: string;
  read: boolean;
}

export const elderInboxService = {
  /** 오늘 받은 하루 한마디 목록 */
  async getInbox(): Promise<ElderInboxItem[]> {
    const response = await get<SwaggerApiResponse<ElderInboxItem[]>>('/elder/inbox');
    return response.data;
  },

  async markAsRead(dailyCareId: string): Promise<void> {
    await post<SwaggerApiResponse<void>>(`/elder/inbox/${dailyCareId}/read`);
  },
};
