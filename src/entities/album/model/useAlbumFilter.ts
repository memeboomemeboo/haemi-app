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

  // 목록이 갱신되어 선택 중인 어르신이 더 이상 없으면 렌더링 중 '전체'로 되돌린다
  // (effect + setState 대신 파생 값으로 처리해 불필요한 리렌더를 피한다)
  const effectiveFilter =
    filter === ALL_FILTER_VALUE || filterOptions.some((option) => option.value === filter)
      ? filter
      : ALL_FILTER_VALUE;

  const visibleItems = useMemo(() => {
    if (effectiveFilter === ALL_FILTER_VALUE) {
      return items;
    }
    return (items ?? []).filter((item) => item.elderName === effectiveFilter);
  }, [items, effectiveFilter]);

  return { filter: effectiveFilter, setFilter, filterOptions, visibleItems };
}
