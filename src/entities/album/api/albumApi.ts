import { getAlbums, type Album } from '@/shared/api/albums';
import type { AlbumItem } from '../model/types';
import { MOCK_ALBUM_ITEMS } from './mock';

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
  try {
    const albums = await getAlbums({ limit: 100 });
    if (albums.length === 0) {
      // API에서 데이터가 없으면 mock으로 대체
      return MOCK_ALBUM_ITEMS;
    }
    return albums.map(transformAlbumToItem);
  } catch (error) {
    console.warn('Failed to fetch albums from API, using fallback data', error);
    return MOCK_ALBUM_ITEMS;
  }
}
