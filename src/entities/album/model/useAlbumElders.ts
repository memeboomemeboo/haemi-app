import { useAsyncData } from '@/shared/hooks';
import { fetchAlbumElders } from '../api/albumApi';

export function useAlbumElders() {
  return useAsyncData(fetchAlbumElders);
}
