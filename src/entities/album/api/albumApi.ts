import { getHomeContext } from '@/shared/api/report';
import { getGroupMemories, type MemoryResult } from '@/shared/api/memories';
import type { AlbumItem } from '../model/types';
import { MOCK_ALBUM_ITEMS } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = false;

/**
 * Album API의 응답을 AlbumItem으로 변환
 */
function transformMemoryToItem(memory: MemoryResult): AlbumItem {
  const image = memory.media?.find(({ type }) => type === 'IMAGE');
  const createdAt = memory.createdAt ? new Date(memory.createdAt) : undefined;

  return {
    id: memory.memoryId ?? `${memory.createdAt}-${memory.authorName}`,
    title: memory.authorName ? `${memory.authorName}님의 기억` : '가족의 기억',
    date: createdAt && !Number.isNaN(createdAt.getTime()) ? `${createdAt.getFullYear()}.${String(createdAt.getMonth() + 1).padStart(2, '0')}.` : '',
    location: memory.authorRelation ?? '',
    description: memory.textContent ?? '',
    photoUrl: image?.accessUrl,
  };
}

export async function fetchAlbumItems(): Promise<AlbumItem[]> {
  if (USE_MOCK) {
    return MOCK_ALBUM_ITEMS;
  }

  try {
    const home = await getHomeContext();
    if (!home?.groupId) return [];
    const memories = await getGroupMemories(home.groupId);
    return memories.map(transformMemoryToItem);
  } catch {
    return MOCK_ALBUM_ITEMS;
  }
}
