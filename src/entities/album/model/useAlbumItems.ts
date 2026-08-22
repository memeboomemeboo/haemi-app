import { useCallback } from 'react';
import { useAsyncData, type AsyncDataState } from '@/shared/hooks';
import type { AlbumItem } from './types';
import { fetchAlbumItems } from '../api/albumApi';

export function useAlbumItems(albumId?: string): AsyncDataState<AlbumItem[]> {
  const fetchItems = useCallback(() => fetchAlbumItems(albumId), [albumId]);

  return useAsyncData(fetchItems);
}
