import { getAlbums, type Album } from '@/shared/api/albums';
import type { AlbumItem } from '../model/types';

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
  const albums = await getAlbums({ limit: 100 });
  return albums.map(transformAlbumToItem);
}
