import { get, post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

export type MemoryResponseType = 'VOICE' | 'TEXT' | 'IMAGE' | 'EMOTION';

export type MemoryResponseEmotion = 'LOVE' | 'HAPPY' | 'JOY' | 'MISS' | 'SAD' | 'LONGING';

export type TranscriptionStatus = 'NOT_APPLICABLE' | 'PENDING' | 'COMPLETED' | 'FAILED';

export interface MemoryResponse {
  id: string;
  responseType: MemoryResponseType;
  emotions?: MemoryResponseEmotion[];
  text?: string;
  transcript?: string;
  transcriptionStatus: TranscriptionStatus;
  mediaKey?: string;
  durationSeconds: number;
  createdAt: string;
}

export const elderMemoryResponseService = {
  /** 음성으로 이야기 전하기 — mediaRefId는 shared/api/media.ts의 업로드 흐름으로 먼저 발급받는다 */
  async postVoiceResponse(
    memoryId: string,
    mediaRefId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>(
      `/elder/memories/${memoryId}/responses/voice`,
      { mediaRefId },
      { signal },
    );
    return response.data;
  },

  async postTextResponse(memoryId: string, text: string): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>(
      `/elder/memories/${memoryId}/responses/text`,
      { text }
    );
    return response.data;
  },

  /** 사진으로 이야기 전하기 — mediaRefId는 shared/api/media.ts의 업로드 흐름으로 먼저 발급받는다 */
  async postImageResponse(
    memoryId: string,
    mediaRefId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>(
      `/elder/memories/${memoryId}/responses/image`,
      { mediaRefId },
      { signal },
    );
    return response.data;
  },

  async postEmotionResponse(
    memoryId: string,
    emotions: MemoryResponseEmotion[],
    signal?: AbortSignal,
  ): Promise<string> {
    const response = await post<SwaggerApiResponse<string>>(
      `/elder/memories/${memoryId}/responses/emotion`,
      { emotions },
      { signal },
    );
    return response.data;
  },

  /** 어르신 본인이 이 추억에 남긴 답변 목록 조회 */
  async getMyResponses(memoryId: string): Promise<MemoryResponse[]> {
    const response = await get<SwaggerApiResponse<MemoryResponse[]>>(
      `/elder/memories/${memoryId}/responses`
    );
    return response.data;
  },
};
