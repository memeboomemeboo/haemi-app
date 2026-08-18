import { useAsyncData, type AsyncDataState } from '@/shared/hooks';
import type { AlbumItem } from './types';
import { fetchAlbumItems } from '../api/albumApi';

export function useAlbumItems(): AsyncDataState<AlbumItem[]> {
  return useAsyncData(fetchAlbumItems);
}
