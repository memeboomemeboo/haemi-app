import { useCallback, useEffect, useRef } from 'react';

import { elderMemoryService } from '@/shared/api';
import { useAsyncData } from '@/shared/hooks';

export function useElderAlbumDetail(memoryId: string) {
  const fetcher = useCallback(() => elderMemoryService.getMemoryDetail(memoryId), [memoryId]);
  const { data: memory, isLoading, isError, refetch } = useAsyncData(fetcher);
  const viewedMemoryIdRef = useRef<string | null>(null);

  // 상세를 성공적으로 불러오면 열람 처리 API를 한 번만 호출한다
  useEffect(() => {
    if (!memory || viewedMemoryIdRef.current === memoryId) return;
    viewedMemoryIdRef.current = memoryId;
    void elderMemoryService.markMemoryViewed(memoryId).catch(() => undefined);
  }, [memory, memoryId]);

  return { memory, isLoading, isError, refetch };
}
