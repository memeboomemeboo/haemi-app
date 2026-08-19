import { getAccessToken } from '@/shared/api/session';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://54.180.61.149:8080';

type ApiResponse<T> = { success?: boolean; data?: T; message?: string };

export type MemoryMediaResult = {
  mediaId?: string;
  type?: 'IMAGE' | 'AUDIO';
  accessUrl?: string;
  durationMs?: number;
  displayOrder?: number;
};

export type MemoryResult = {
  memoryId?: string;
  groupId?: string;
  authorName?: string;
  authorRelation?: string;
  textContent?: string;
  createdAt?: string;
  media?: MemoryMediaResult[];
};

type MemoryFeedResult = {
  memories?: MemoryResult[];
  hasNext?: boolean;
};

export async function getGroupMemories(groupId: string, page = 0, size = 100) {
  const token = await getAccessToken();
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}/memories?${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const body = await response.json() as ApiResponse<MemoryFeedResult>;

  if (!response.ok || body.success === false) {
    throw new Error(body.message ?? `가족 추억을 불러오지 못했습니다. (${response.status})`);
  }

  return body.data?.memories ?? [];
}
