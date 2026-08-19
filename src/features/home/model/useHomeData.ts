import { useAsyncData, type AsyncDataState } from '@/shared/hooks';
import { fetchHomeData } from '../api/homeApi';
import type { HomeData } from './types';

export function useHomeData(): AsyncDataState<HomeData> {
  return useAsyncData(fetchHomeData);
}
