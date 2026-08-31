import { useCallback } from 'react';
import { useAsyncData, type AsyncDataState } from '@/shared/hooks';
import type { AlbumItem } from './types';
import { fetchAlbumItems } from '../api/albumApi';

export function useAlbumItems(elderId?: string): AsyncDataState<AlbumItem[]> {
  const fetcher = useCallback(() => fetchAlbumItems(elderId), [elderId]);
  return useAsyncData(fetcher);
}
