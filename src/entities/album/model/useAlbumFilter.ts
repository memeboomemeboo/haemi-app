import { useMemo, useState } from 'react';
import type { AlbumElderOption } from './types';

/** 앨범 필터 값 — '전체' 또는 특정 어르신 id */
export type AlbumFilter = string;

export const ALL_FILTER_VALUE: AlbumFilter = 'all';

export interface AlbumFilterOption {
  value: AlbumFilter;
  label: string;
}

/** 어르신별 앨범 필터 탭 — 실제 접근 가능한 어르신 목록만큼 탭이 생긴다 */
export function useAlbumFilter(elders: AlbumElderOption[] | null) {
  const [filter, setFilter] = useState<AlbumFilter>(ALL_FILTER_VALUE);

  const filterOptions = useMemo<AlbumFilterOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: '전체' },
      ...(elders ?? []).map((elder) => ({ value: elder.id, label: elder.name })),
    ],
    [elders],
  );

  // 어르신 목록이 갱신되어 선택 중인 탭이 더 이상 없으면 렌더링 중 '전체'로 되돌린다
  // (effect + setState 대신 파생 값으로 처리해 불필요한 리렌더를 피한다)
  const effectiveFilter =
    filter === ALL_FILTER_VALUE || filterOptions.some((option) => option.value === filter)
      ? filter
      : ALL_FILTER_VALUE;

  const selectedElderId = effectiveFilter === ALL_FILTER_VALUE ? undefined : effectiveFilter;

  return { filter: effectiveFilter, setFilter, filterOptions, selectedElderId };
}
