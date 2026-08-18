import type {
  CreateFamilyMemoryPostParams,
  FamilyMemoryApiResponse,
  FamilyMemoryFeed,
  FamilyMemoryPost,
  GetFamilyMemoryFeedParams,
} from '@/shared/types/family-memories';

// 기본 API URL (환경변수)
const HAEMI_API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set');
}

class HaemiApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HaemiApiError';
    this.status = status;
  }
}

function getAccessToken() {
  return process.env.EXPO_PUBLIC_HAEMI_ACCESS_TOKEN;
}

async function readResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? (JSON.parse(text) as FamilyMemoryApiResponse<T>) : undefined;

  if (!response.ok || body?.success === false) {
    throw new HaemiApiError(response.status, body?.message || '요청 처리 중 오류가 발생했습니다.');
  }

  return (body?.data ?? (body as T)) as T;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
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

  const response = await fetch(`${HAEMI_API_BASE_URL}/albums/${albumId}/feed?${searchParams}`, {
    headers: getAuthHeaders(),
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

  const response = await fetch(`${HAEMI_API_BASE_URL}/albums/${albumId}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return readResponse<FamilyMemoryPost>(response);
}

export async function toggleFamilyMemoryLike(albumId: string, postId: string, memberId: string) {
  const searchParams = new URLSearchParams({ memberId });
  const response = await fetch(
    `${HAEMI_API_BASE_URL}/albums/${albumId}/posts/${postId}/like?${searchParams}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  return readResponse<FamilyMemoryPost>(response);
}
