import { useCallback } from 'react';
import { useAsyncData } from '@/shared/hooks';
import { fetchAlbumDetail } from '../api/albumApi';

export function useAlbumDetail(id: string) {
  const fetcher = useCallback(() => fetchAlbumDetail(id), [id]);
  const { data: item, isLoading, error, refetch } = useAsyncData(fetcher);
  return { item, isLoading, error, refetch };
}
