import { useAsyncData } from '@/shared/hooks';
import { fetchAlbumItems } from '../api/albumApi';

export function useAlbumItems() {
  const { data: items, isLoading, error, refetch } = useAsyncData(fetchAlbumItems);
  return { items, isLoading, error, refetch };
}
