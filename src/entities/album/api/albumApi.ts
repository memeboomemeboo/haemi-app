import { getAlbums, type Album } from '@/shared/api/albums';
import type { AlbumItem } from '../model/types';
import { MOCK_ALBUM_ITEMS } from './mock';

/** API 서버가 준비되면 false로 바꾸면 실제 엔드포인트로 연결된다. */
const USE_MOCK = false;

/**
 * Album API의 응답을 AlbumItem으로 변환
 */
function transformAlbumToItem(album: Album): AlbumItem {
  return {
    id: album.id,
    title: album.name,
    date: '', // API에서 제공하지 않으면 빈 문자열
    location: '', // API에서 제공하지 않으면 빈 문자열
    description: album.description || '',
    photoUrl: album.coverImageUrl,
  };
}

export async function fetchAlbumItems(): Promise<AlbumItem[]> {
  if (USE_MOCK) {
    return MOCK_ALBUM_ITEMS;
  }

  try {
    const albums = await getAlbums({ limit: 100 });
    return albums.map(transformAlbumToItem);
  } catch (error) {
    console.warn('Failed to fetch albums from API, using fallback data', error);
    return MOCK_ALBUM_ITEMS;
  }
}
