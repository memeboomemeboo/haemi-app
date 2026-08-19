import { apiClient } from '@/shared/api';
import type { Group } from '@/shared/types';
import type {
  HomeContext,
  HomeData,
  HomeMemory,
  HomeMetric,
  TodayReminiscence,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface MemberProfile {
  name?: string;
}

interface ElderProfile {
  name?: string;
}

interface MemoryFeed {
  memories?: HomeMemory[];
}

const dateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function fetchHomeData(): Promise<HomeData> {
  const [contextResponse, memberResponse] = await Promise.all([
    apiClient.get<ApiResponse<HomeContext>>('/home'),
    apiClient.get<ApiResponse<MemberProfile>>('/auth/me'),
  ]);

  const context = contextResponse.data;
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  // 현재 홈 컨텍스트 명세에는 albumId가 선택적이므로, 기존 그룹-앨범 1:1 구성도 지원한다.
  const albumId = context.albumId ?? context.groupId;

  const [elderResult, groupResult, memoryResult, metricResult, reminiscenceResult] = await Promise.allSettled([
    context.elderId
      ? apiClient.get<ApiResponse<ElderProfile>>(`/elders/${context.elderId}`)
      : Promise.resolve(null),
    context.groupId
      ? apiClient.get<ApiResponse<Group>>(`/groups/${context.groupId}`)
      : Promise.resolve(null),
    context.groupId
      ? apiClient.get<ApiResponse<MemoryFeed>>(`/groups/${context.groupId}/memories?page=0&size=20`)
      : Promise.resolve(null),
    context.elderId
      ? apiClient.get<ApiResponse<HomeMetric[]>>(
          `/cognitive-dashboard/metrics?elderId=${encodeURIComponent(context.elderId)}&from=${dateKey(weekAgo)}&to=${dateKey(today)}`
        )
      : Promise.resolve(null),
    albumId
      ? apiClient.get<ApiResponse<TodayReminiscence | null>>(
          `/albums/${encodeURIComponent(albumId)}/reminiscence/today`
        )
      : Promise.resolve(null),
  ]);

  const elder = elderResult.status === 'fulfilled' ? elderResult.value?.data : undefined;
  const group = groupResult.status === 'fulfilled' ? groupResult.value?.data : undefined;
  const memories = memoryResult.status === 'fulfilled' ? memoryResult.value?.data.memories ?? [] : [];
  const metrics = metricResult.status === 'fulfilled' ? metricResult.value?.data ?? [] : [];
  const todayReminiscence =
    reminiscenceResult.status === 'fulfilled' ? reminiscenceResult.value?.data ?? null : null;
  const joinedAt = group?.createdAt ? new Date(group.createdAt) : today;
  const connectionDays = Math.max(1, Math.floor((today.getTime() - joinedAt.getTime()) / 86_400_000) + 1);
  const todayMemoryCount = memories.filter((memory) => memory.createdAt?.startsWith(dateKey(today))).length;
  const weeklyConversationMinutes = Math.round(
    metrics.reduce((sum, metric) => sum + (metric.averageDwellMs ?? 0) * (metric.sessionCount ?? 0), 0) / 60_000
  );

  return {
    userName: memberResponse.data.name || '가족',
    elderName: elder?.name || '어르신',
    connectionDays,
    memories,
    todayMemoryCount,
    weeklyConversationMinutes,
    metrics,
    todayReminiscence,
  };
}
