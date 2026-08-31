import { get, post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

export type DailyCareType = 'TEXT' | 'VOICE';

export interface DailyCareSent {
  id: string;
  careDate: string;
  type: DailyCareType;
  text?: string;
  mediaKey?: string;
  durationSeconds?: number;
  read: boolean;
}

export interface SendVoiceDailyCareRequest {
  mediaRefId: string;
  durationSeconds: number;
}

export const guardianDailyCareService = {
  /** 발신자(보호자) 본인이 보낸 하루 한마디 이력만 반환한다 */
  async getSentHistory(elderId: string): Promise<DailyCareSent[]> {
    const response = await get<SwaggerApiResponse<DailyCareSent[]>>(
      `/guardian/elders/${elderId}/daily-care/sent`,
    );
    return response.data;
  },

  async sendText(elderId: string, text: string): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>(
      `/guardian/elders/${elderId}/daily-care/text`,
      { text },
    );
    return response.data;
  },

  async sendVoice(elderId: string, data: SendVoiceDailyCareRequest): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>(
      `/guardian/elders/${elderId}/daily-care/voice`,
      data,
    );
    return response.data;
  },
};
