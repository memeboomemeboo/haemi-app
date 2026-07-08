import { apiClient } from '@/shared/api';
import type { AlbumItem } from '../model/types';
import { MOCK_ALBUM_ITEMS } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = true;

export async function fetchAlbumItems(): Promise<AlbumItem[]> {
  if (USE_MOCK) {
    return MOCK_ALBUM_ITEMS;
  }
  return apiClient.get<AlbumItem[]>('/albums');
}
