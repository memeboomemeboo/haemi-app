import type { AlbumItem } from '../model/types';
import { MOCK_ALBUM_ITEMS } from './mock';

/**
 * 목업 모드에서 쓰는 인메모리 저장소. 새로고침(앱 재시작)하면 초기화된다.
 * API 연결 후에는 albumApi.ts에서 이 파일을 더 이상 참조하지 않게 된다.
 */
let items: AlbumItem[] = [...MOCK_ALBUM_ITEMS];

export function getAlbumItems(): AlbumItem[] {
  return items;
}

export function findAlbumItem(id: string): AlbumItem | undefined {
  return items.find((item) => item.id === id);
}

export function addAlbumItem(item: AlbumItem): void {
  items = [item, ...items];
}
