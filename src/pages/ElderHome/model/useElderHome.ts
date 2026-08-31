import { elderInboxService } from '@/shared/api';
import { getElderHome } from '@/shared/api/elderHome';
import { useAsyncData } from '@/shared/hooks';

export function useElderHome() {
  const { data, isLoading, isError, refetch } = useAsyncData(getElderHome);
  const { data: inbox } = useAsyncData(elderInboxService.getInbox);

  const unreadInboxCount = inbox?.filter((item) => !item.read).length ?? 0;

  return {
    homeData: data,
    unreadInboxCount,
    isLoading,
    isError,
    refetch,
  };
}
