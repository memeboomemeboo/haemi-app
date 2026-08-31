import { useSyncExternalStore, useEffect, useState } from 'react';

import type { CreateFamilyMemoryItemParams, FamilyMemoryItem } from './types';
import {
  getFamilyMemoryFeed,
  createFamilyMemoryPost,
  updateFamilyMemoryPost,
  deleteFamilyMemoryPost,
} from '@/shared/api/family-memories';
import type { FamilyMemoryPost } from '@/shared/types/family-memories';

type Listener = () => void;

const listeners = new Set<Listener>();

let memoryItems: FamilyMemoryItem[] = [];
let isLoading = false;
let error: Error | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return memoryItems;
}

// 서버의 FamilyMemoryPost를 로컬 FamilyMemoryItem으로 변환
function convertPostToItem(post: FamilyMemoryPost): FamilyMemoryItem {
  return {
    id: post.postId,
    authorName: post.authorName || '가족',
    authorRelation: post.authorRelation || '친구',
    memo: post.textContent || '',
    hasPhoto: (post.photoKeys?.length ?? 0) > 0,
    photoUri: post.photoKeys?.[0] ?? null,
    photoUris: post.photoKeys ?? [],
    hasVoiceMemo: !!post.voiceMemoKey,
    voiceDurationSeconds: 0,
    voiceUri: post.voiceMemoKey ?? null,
    voiceSegments: post.voiceMemoKey ? [{ uri: post.voiceMemoKey, durationSeconds: 0 }] : [],
    createdAt: post.createdAt || new Date().toISOString(),
  };
}

export async function fetchFamilyMemoryItems(albumId: string) {
  try {
    isLoading = true;
    error = null;
    const feed = await getFamilyMemoryFeed({ albumId, page: 0, size: 50 });
    memoryItems = feed.posts.map(convertPostToItem);
    emitChange();
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to fetch memories');
    console.error('Failed to fetch family memories:', error);
  } finally {
    isLoading = false;
  }
}

export async function addFamilyMemoryItem(
  albumId: string,
  memberId: string,
  memberName: string,
  memberRelation: string,
  {
    memo,
    hasPhoto,
    photoUri = null,
    photoUris,
    hasVoiceMemo = false,
    voiceDurationSeconds = 0,
    voiceUri = null,
    voiceSegments,
  }: CreateFamilyMemoryItemParams,
) {
  try {
    const nextPhotoUris = photoUris ?? (photoUri ? [photoUri] : []);

    const response = await createFamilyMemoryPost({
      albumId,
      data: {
        memberId,
        memberName,
        relation: memberRelation,
        textContent: memo.trim(),
        publishImmediately: true,
      },
      photos: nextPhotoUris.map((uri) => ({ uri })),
    });

    const newItem = convertPostToItem(response);
    memoryItems = [newItem, ...memoryItems];
    emitChange();

    return newItem;
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to add memory');
    console.error('Failed to add family memory:', error);
    throw error;
  }
}

export async function removeFamilyMemoryItem(albumId: string, id: string) {
  try {
    await deleteFamilyMemoryPost(albumId, id);
    memoryItems = memoryItems.filter((item) => item.id !== id);
    emitChange();
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to delete memory');
    console.error('Failed to delete family memory:', error);
    throw error;
  }
}

export async function updateFamilyMemoryItem(
  albumId: string,
  id: string,
  memberId: string,
  memberName: string,
  memberRelation: string,
  nextItem: Partial<Pick<FamilyMemoryItem, 'memo' | 'hasPhoto' | 'photoUri' | 'photoUris' | 'hasVoiceMemo' | 'voiceDurationSeconds' | 'voiceUri' | 'voiceSegments'>>,
) {
  try {
    const updateData: any = {};
    if (nextItem.memo !== undefined) {
      updateData.textContent = nextItem.memo;
    }
    if (nextItem.photoUris !== undefined) {
      updateData.photoKeys = nextItem.photoUris;
    }

    await updateFamilyMemoryPost(albumId, id, updateData);

    memoryItems = memoryItems.map((item) => (
      item.id === id
        ? {
            ...item,
            ...nextItem,
          }
        : item
    ));
    emitChange();
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to update memory');
    console.error('Failed to update family memory:', error);
    throw error;
  }
}

export function useFamilyMemoryItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFamilyMemoryState() {
  return {
    items: useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
    isLoading,
    error,
  };
}
