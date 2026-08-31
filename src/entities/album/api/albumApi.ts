import { apiClient, myPageService, uploadMediaFile } from '@/shared/api';
import type { SwaggerApiResponse } from '@/shared/types';
import type { AlbumConversationAnswer, AlbumItem, NewAlbumItemInput } from '../model/types';

interface MemorySummaryResponse {
  id: string;
  elderId: string;
  title: string;
  thumbnailKey?: string;
  responded: boolean;
  place?: string;
  memoryYear?: number;
  memoryMonth?: number;
  creatorRoleLabel?: string;
}

interface MemoryDetailResponse {
  id: string;
  elderId: string;
  title: string;
  memo?: string;
  message?: string;
  memoryYear?: number;
  memoryMonth?: number;
  place?: string;
  imageKeys?: string[];
  responded: boolean;
  createdAt?: string;
  creatorRoleLabel?: string;
}

interface MemoryResponseItem {
  responseType: 'EMOTION' | 'TEXT' | 'IMAGE' | 'VOICE' | string;
  emotions?: string[];
  text?: string;
  durationSeconds?: number;
  createdAt?: string;
}

interface RegisterMemoryRequest {
  elderId: string;
  title: string;
  memo?: string;
  message: string;
  memoryYear?: number;
  mediaRefIds: string[];
}

const EMOTION_LABELS: Record<string, string> = {
  LOVE: '사랑',
  HAPPY: '행복',
  JOY: '기쁨',
  MISS: '그리움',
  LONGING: '그리움',
  SAD: '슬픔',
  ANGRY: '화남',
};

const formatMemoryDate = (year?: number, month?: number): string | undefined => {
  if (!year) return undefined;
  return month ? `${year}.${String(month).padStart(2, '0')}.` : `${year}.`;
};

const formatRelativeTime = (createdAt?: string): string => {
  if (!createdAt) return '';
  const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000));
  return days === 0 ? '오늘' : `${days}일전`;
};

const formatClock = (createdAt?: string): string => {
  if (!createdAt) return '';
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(createdAt),
  );
};

const formatDuration = (seconds = 0): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const toConversationAnswer = (
  responses: MemoryResponseItem[],
  elderName: string,
): AlbumConversationAnswer | undefined => {
  if (responses.length === 0) return undefined;
  const sorted = [...responses].sort((a, b) =>
    (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  );
  const latest = sorted[0];
  const textResponse = sorted.find((response) => response.text?.trim());
  const voiceResponse = sorted.find((response) => response.responseType === 'VOICE');
  const tags = Array.from(
    new Set(
      responses
        .flatMap((response) => response.emotions ?? [])
        .map((value) => EMOTION_LABELS[value] ?? value),
    ),
  );

  return {
    authorName: `${elderName} 님`,
    relativeTime: formatRelativeTime(latest.createdAt),
    time: formatClock(latest.createdAt),
    tags,
    quote: textResponse?.text?.trim() || '음성으로 답변을 남겼어요.',
    audioDuration: formatDuration(voiceResponse?.durationSeconds),
  };
};

export async function fetchAlbumItems(): Promise<AlbumItem[]> {
  const response = await apiClient.get<SwaggerApiResponse<MemorySummaryResponse[]>>(
    '/guardian/memories',
  );

  return response.data.map((memory) => ({
    id: memory.id,
    elderId: memory.elderId,
    title: memory.title,
    elderName: '어르신',
    date: formatMemoryDate(memory.memoryYear, memory.memoryMonth),
    location: memory.place,
    photoUrl: memory.thumbnailKey,
    year: memory.memoryYear ? `${memory.memoryYear}년` : undefined,
    senderRelation: memory.creatorRoleLabel,
    responded: memory.responded,
  }));
}

export async function fetchAlbumDetail(id: string): Promise<AlbumItem | null> {
  const [detailResponse, responsesResponse, profile] = await Promise.all([
    apiClient.get<SwaggerApiResponse<MemoryDetailResponse>>(`/guardian/memories/${id}`),
    apiClient.get<SwaggerApiResponse<MemoryResponseItem[]>>(`/guardian/memories/${id}/responses`),
    myPageService.getProfile(),
  ]);
  const memory = detailResponse.data;
  if (!memory) return null;
  const elderName = profile.elders.find((elder) => elder.elderId === memory.elderId)?.name ?? '어르신';
  const answer = toConversationAnswer(responsesResponse.data ?? [], elderName);

  return {
    id: memory.id,
    elderId: memory.elderId,
    title: memory.title,
    elderName,
    date: formatMemoryDate(memory.memoryYear, memory.memoryMonth),
    location: memory.place,
    photoUrl: memory.imageKeys?.[0],
    photos: memory.imageKeys,
    year: memory.memoryYear ? `${memory.memoryYear}년` : undefined,
    memo: memory.memo,
    senderRelation: memory.creatorRoleLabel,
    responded: memory.responded,
    conversation: memory.message
      ? { question: memory.message, askedRelativeTime: formatRelativeTime(memory.createdAt), answer }
      : undefined,
  };
}

export async function createAlbumItem(input: NewAlbumItemInput): Promise<AlbumItem> {
  const uploads = await Promise.all(
    (input.photos ?? []).map((photo) =>
      uploadMediaFile({
        uri: photo.uri,
        mediaType: 'MEMORY_IMAGE',
        filename: photo.fileName,
        contentType: photo.contentType,
        sizeBytes: photo.sizeBytes,
      }),
    ),
  );
  const memoryYear = Number.parseInt(input.year, 10);
  const payload: RegisterMemoryRequest = {
    elderId: input.elderId,
    title: input.title,
    memo: input.memo,
    message: input.question ?? '',
    memoryYear: Number.isFinite(memoryYear) ? memoryYear : undefined,
    mediaRefIds: uploads.map((upload) => upload.mediaRefId),
  };
  const response = await apiClient.post<SwaggerApiResponse<string>>('/guardian/memories', payload);

  return {
    id: response.data,
    elderId: input.elderId,
    title: input.title,
    elderName: input.elderName,
    year: payload.memoryYear ? `${payload.memoryYear}년` : undefined,
    memo: input.memo,
    photos: uploads.map((upload, index) => upload.servingUrl ?? input.photos?.[index].uri ?? ''),
    photoUrl: uploads[0]?.servingUrl,
    conversation: input.question
      ? { question: input.question, askedRelativeTime: '방금 전' }
      : undefined,
  };
}
