import { guardianMemoryService, myPageService } from '@/shared/api';
import type { GuardianMemoryDetail, GuardianMemorySummary } from '@/shared/api';
import { formatRelativeKoreanDate } from '@/shared/lib';
import type { AlbumElderOption, AlbumItem, NewAlbumItemInput } from '../model/types';

/** 보호자가 접근 가능한 어르신 목록 — 앨범 필터 탭과 등록 화면의 대상 선택에 쓰인다 */
export async function fetchAlbumElders(): Promise<AlbumElderOption[]> {
  const profile = await myPageService.getProfile();
  return profile.elders.map((elder) => ({ id: elder.elderId, name: elder.name }));
}

function toAlbumItem(memory: GuardianMemorySummary, elderName: string): AlbumItem {
  return {
    id: memory.id,
    elderId: memory.elderId,
    title: memory.title,
    elderName,
    location: memory.place,
    photoUrl: memory.thumbnailKey,
    year: `${memory.memoryYear}년`,
    responded: memory.responded,
    senderRelation: memory.creatorRoleLabel,
  };
}

function toAlbumItemDetail(memory: GuardianMemoryDetail, elderName: string): AlbumItem {
  return {
    id: memory.id,
    elderId: memory.elderId,
    title: memory.title,
    elderName,
    location: memory.place,
    year: `${memory.memoryYear}년`,
    photos: memory.imageKeys,
    memo: memory.memo,
    responded: memory.responded,
    senderRelation: memory.creatorRoleLabel,
    conversation: {
      question: memory.message,
      askedRelativeTime: formatRelativeKoreanDate(memory.createdAt),
    },
  };
}

/** elderId를 지정하면 해당 어르신 추억만, 미지정 시 접근 가능한 전 어르신 추억을 통합('전체' 탭) 조회한다 */
export async function fetchAlbumItems(elderId?: string): Promise<AlbumItem[]> {
  const [memories, elders] = await Promise.all([
    guardianMemoryService.getMemories(elderId),
    fetchAlbumElders(),
  ]);
  const elderNameById = new Map(elders.map((elder) => [elder.id, elder.name]));
  return memories.map((memory) => toAlbumItem(memory, elderNameById.get(memory.elderId) ?? ''));
}

export async function fetchAlbumDetail(id: string): Promise<AlbumItem | null> {
  const [memory, elders] = await Promise.all([
    guardianMemoryService.getMemoryDetail(id),
    fetchAlbumElders(),
  ]);
  const elderName = elders.find((elder) => elder.id === memory.elderId)?.name ?? '';
  return toAlbumItemDetail(memory, elderName);
}

/** 등록 화면에는 연도 입력만 있어 월은 아직 받을 수 없다 — 1월로 고정한다 */
const DEFAULT_MEMORY_MONTH = 1;

export async function createAlbumItem(input: NewAlbumItemInput): Promise<string> {
  return guardianMemoryService.createMemory({
    elderId: input.elderId,
    title: input.title,
    memo: input.memo,
    message: input.question,
    memoryYear: Number(input.year) || new Date().getFullYear(),
    memoryMonth: DEFAULT_MEMORY_MONTH,
    place: input.place,
    mediaRefIds: input.mediaRefIds,
  });
}
