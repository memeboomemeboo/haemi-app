import { apiClient } from '@/shared/api';
import type { AlbumItem, NewAlbumItemInput } from '../model/types';
import { addAlbumItem, findAlbumItem, getAlbumItems } from './store';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = true;

export async function fetchAlbumItems(): Promise<AlbumItem[]> {
  if (USE_MOCK) {
    return getAlbumItems();
  }
  return apiClient.get<AlbumItem[]>('/albums');
}

export async function fetchAlbumDetail(id: string): Promise<AlbumItem | null> {
  if (USE_MOCK) {
    return findAlbumItem(id) ?? null;
  }
  return apiClient.get<AlbumItem>(`/albums/${id}`);
}

export async function createAlbumItem(input: NewAlbumItemInput): Promise<AlbumItem> {
  if (USE_MOCK) {
    const item: AlbumItem = {
      id: `album-${Date.now()}`,
      title: input.title,
      elderName: input.elderName,
      year: input.year,
      memo: input.memo,
      photos: input.photos,
      photoUrl: input.photos?.[0],
      conversation: input.question
        ? { question: input.question, askedRelativeTime: '방금 전' }
        : undefined,
    };
    addAlbumItem(item);
    return item;
  }
  return apiClient.post<AlbumItem>('/albums', input);
}
