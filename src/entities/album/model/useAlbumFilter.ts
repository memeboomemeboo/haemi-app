import { useMemo, useState } from 'react';
import type { AlbumItem } from './types';

export interface AlbumElderOption {
  elderId: string;
  name: string;
}

/** 앨범 필터 값 — '전체' 또는 특정 어르신 이름 */
export type AlbumFilter = string;

export const ALL_FILTER_VALUE: AlbumFilter = 'all';

export interface AlbumFilterOption {
  value: AlbumFilter;
  label: string;
}

/** 보호자가 관리하는 전체 어르신을 기준으로 앨범을 필터링한다. */
export function useAlbumFilter(items: AlbumItem[] | null, elders: AlbumElderOption[] = []) {
  const [filter, setFilter] = useState<AlbumFilter>(ALL_FILTER_VALUE);

  const filterOptions = useMemo<AlbumFilterOption[]>(() => {
    const elderOptions = elders.length > 0
      ? elders.map((elder) => ({ value: elder.elderId, label: elder.name }))
      : Array.from(
          new Map(
            (items ?? []).map((item) => [
              item.elderId ?? item.elderName,
              { value: item.elderId ?? item.elderName, label: item.elderName },
            ]),
          ).values(),
        );
    return [
      { value: ALL_FILTER_VALUE, label: '전체' },
      ...elderOptions,
    ];
  }, [elders, items]);

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
    return (items ?? []).filter(
      (item) => (item.elderId ?? item.elderName) === effectiveFilter,
    );
  }, [items, effectiveFilter]);

  return { filter: effectiveFilter, setFilter, filterOptions, visibleItems };
}
