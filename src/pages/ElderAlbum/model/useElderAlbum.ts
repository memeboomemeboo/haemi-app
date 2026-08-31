import { elderMemoryService } from '@/shared/api';
import { useAsyncData } from '@/shared/hooks';

export function useElderAlbum() {
  const { data: memories, isLoading, isError, refetch } = useAsyncData(elderMemoryService.getMemories);

  return { memories, isLoading, isError, refetch };
}
