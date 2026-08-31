import { get, getElderHome, type ElderHomeResponse } from '@/shared/api';
import type { SwaggerApiResponse } from '@/shared/types';
import type {
  DailyMessageNotification,
  ElderHomeSummary,
  MemoryNotification,
} from '../model/types';

interface ElderMemorySummaryResponse {
  id: string;
  title?: string;
  message?: string;
  memoryYear?: number;
  imageKeys?: string[];
  responded: boolean;
  createdAt?: string;
  creatorName?: string | null;
  creatorRole?: string | null;
  creatorRoleLabel?: string | null;
}

interface ElderInboxItemResponse {
  id: string;
  guardianId: string;
  type: string;
  text?: string | null;
  mediaKey?: string | null;
  durationSeconds?: number | null;
  read: boolean;
}

export async function fetchElderHomeSummary(): Promise<ElderHomeSummary> {
  const home = await getElderHome();
  const [memoriesResult, inboxResult] = await Promise.allSettled([
    fetchElderMemories(),
    fetchElderInbox(),
  ]);

  const memories = memoriesResult.status === 'fulfilled' ? memoriesResult.value : [];
  const inbox = inboxResult.status === 'fulfilled' ? inboxResult.value : [];

  return {
    memory: createMemoryNotification(home, memories),
    dailyMessage: createDailyMessageNotification(home, inbox),
  };
}

async function fetchElderMemories(): Promise<ElderMemorySummaryResponse[]> {
  const res = await get<SwaggerApiResponse<ElderMemorySummaryResponse[]>>('/elder/memories');
  return res.data;
}

async function fetchElderInbox(): Promise<ElderInboxItemResponse[]> {
  const res = await get<SwaggerApiResponse<ElderInboxItemResponse[]>>('/elder/inbox');
  return res.data;
}

function createMemoryNotification(
  home: ElderHomeResponse,
  memories: ElderMemorySummaryResponse[],
): MemoryNotification {
  const recentMemories = home.recentMemories ?? [];
  const newMemories = recentMemories.filter((memory) => !memory.responded);
  const firstNewMemory = newMemories[0];

  if (firstNewMemory) {
    const detailedMemory = memories.find((memory) => memory.id === firstNewMemory.id);
    return {
      status: 'new',
      unreadCount: newMemories.length,
      senderLabel: getMemorySenderLabel(detailedMemory),
      albumId: firstNewMemory.id,
    };
  }

  if (recentMemories.length > 0 || memories.length > 0) {
    return { status: 'none-new' };
  }

  return { status: 'empty' };
}

function createDailyMessageNotification(
  home: ElderHomeResponse,
  inbox: ElderInboxItemResponse[],
): DailyMessageNotification {
  const unreadCount = home.greeting?.unread ?? 0;
  const unreadMessage = inbox.find((message) => !message.read);
  const hasUnreadMessage = unreadCount > 0 || Boolean(unreadMessage);

  if (hasUnreadMessage) {
    return {
      status: 'received',
      durationLabel: formatDurationLabel(unreadMessage?.durationSeconds),
    };
  }

  return { status: 'pending' };
}

function getMemorySenderLabel(memory?: ElderMemorySummaryResponse): string | undefined {
  if (!memory) {
    return undefined;
  }

  const roleLabel = memory.creatorRoleLabel?.trim();
  const creatorName = memory.creatorName?.trim();

  if (!roleLabel && !creatorName) {
    return undefined;
  }

  if (!creatorName) {
    return roleLabel;
  }

  const honorificName = creatorName.endsWith('님') ? creatorName : `${creatorName}님`;
  return [roleLabel, honorificName].filter(Boolean).join(' ');
}

function formatDurationLabel(durationSeconds?: number | null): string | undefined {
  if (!durationSeconds || durationSeconds <= 0) {
    return undefined;
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
