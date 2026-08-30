import { useMemo, useState } from 'react';
import type { AlbumItem } from './types';

/** 앨범 필터 값 — '전체' 또는 특정 어르신 이름 */
export type AlbumFilter = string;

export const ALL_FILTER_VALUE: AlbumFilter = 'all';

export interface AlbumFilterOption {
  value: AlbumFilter;
  label: string;
}

/** 어르신별로 앨범을 필터링한다 — 목록에 등장하는 이름만큼 탭이 생긴다 */
export function useAlbumFilter(items: AlbumItem[] | null) {
  const [filter, setFilter] = useState<AlbumFilter>(ALL_FILTER_VALUE);

  const filterOptions = useMemo<AlbumFilterOption[]>(() => {
    const elderNames = Array.from(new Set((items ?? []).map((item) => item.elderName)));
    return [
      { value: ALL_FILTER_VALUE, label: '전체' },
      ...elderNames.map((name) => ({ value: name, label: name })),
    ];
  }, [items]);

  const visibleItems = useMemo(() => {
    if (filter === ALL_FILTER_VALUE) {
      return items;
    }
    return (items ?? []).filter((item) => item.elderName === filter);
  }, [items, filter]);

  return { filter, setFilter, filterOptions, visibleItems };
}
