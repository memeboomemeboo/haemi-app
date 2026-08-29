import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { getElderHome } from '@/shared/api/elderHome';
import { useAsyncData } from '@/shared/hooks';

export function useElderHome() {
  const router = useRouter();

  const { data, isLoading, refetch } = useAsyncData(getElderHome);

  const taskStatus = data
    ? {
        greetingCompleted: data.greeting.totalToday > data.greeting.unread,
        trainingCompleted: data.training.completedToday,
        memoryCompleted:
          data.recentMemories.length > 0 && data.recentMemories.every((m) => m.responded),
      }
    : undefined;

  const handleTaskPress = useCallback(
    (index: number) => {
      if (index === 1) router.push('/quiz');
    },
    [router],
  );

  return {
    homeData: data,
    isLoading,
    taskStatus,
    handleTaskPress,
    refetch,
  };
}
