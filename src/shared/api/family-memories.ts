import type {
  CreateFamilyMemoryPostParams,
  FamilyMemoryApiResponse,
  FamilyMemoryFeed,
  FamilyMemoryPost,
  GetFamilyMemoryFeedParams,
} from '@/shared/types/family-memories';
import { getAccessToken } from '@/shared/api/session';

const HAEMI_API_BASE_URL = 'http://54.180.61.149:8080';

class HaemiApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HaemiApiError';
    this.status = status;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? (JSON.parse(text) as FamilyMemoryApiResponse<T>) : undefined;

  if (!response.ok || body?.success === false) {
    throw new HaemiApiError(response.status, body?.message || '요청 처리 중 오류가 발생했습니다.');
  }

  return (body?.data ?? (body as T)) as T;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getFamilyMemoryFeed({
  albumId,
  sortBy = 'LATEST',
  period = 'ALL',
  page = 0,
  size = 20,
}: GetFamilyMemoryFeedParams) {
  const searchParams = new URLSearchParams({
    sortBy,
    period,
    page: String(page),
    size: String(size),
  });

  const response = await fetch(`${HAEMI_API_BASE_URL}/api/v1/albums/${albumId}/feed?${searchParams}`, {
    headers: await getAuthHeaders(),
  });

  return readResponse<FamilyMemoryFeed>(response);
}

export async function createFamilyMemoryPost({ albumId, data, photos = [] }: CreateFamilyMemoryPostParams) {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

  photos.forEach((photo, index) => {
    formData.append('photos', {
      uri: photo.uri,
      name: photo.fileName || `family-memory-${index + 1}.jpg`,
      type: photo.mimeType || 'image/jpeg',
    } as unknown as Blob);
  });

  const response = await fetch(`${HAEMI_API_BASE_URL}/api/v1/albums/${albumId}/posts`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: formData,
  });

  return readResponse<FamilyMemoryPost>(response);
}

export async function toggleFamilyMemoryLike(albumId: string, postId: string, memberId: string) {
  const searchParams = new URLSearchParams({ memberId });
  const response = await fetch(
    `${HAEMI_API_BASE_URL}/api/v1/albums/${albumId}/posts/${postId}/like?${searchParams}`,
    {
      method: 'POST',
      headers: await getAuthHeaders(),
    }
  );

  return readResponse<FamilyMemoryPost>(response);
}
