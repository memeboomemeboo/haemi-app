import { getOrCreateAlbum, type AlbumPhoto } from '@/shared/api/albums';
import type { AlbumItem } from '../model/types';

/**
 * Album API의 응답을 AlbumItem으로 변환
 */
function transformPhotoToItem(photo: AlbumPhoto): AlbumItem {
  return {
    id: photo.photoId,
    title: photo.memo || '',
    date: photo.timePeriod || '',
    location: photo.locationText || '',
    description: photo.memo || '',
    photoUrl: photo.storageKey.startsWith('http') ? photo.storageKey : undefined,
  };
}

export async function fetchAlbumItems(albumId?: string): Promise<AlbumItem[]> {
  const album = await getOrCreateAlbum(albumId);
  return album.recentPhotos.map(transformPhotoToItem);
}
