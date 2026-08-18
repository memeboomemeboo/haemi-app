import { useSyncExternalStore } from 'react';

import type { CreateFamilyMemoryItemParams, FamilyMemoryItem } from './types';

type Listener = () => void;

const listeners = new Set<Listener>();

let memoryItems: FamilyMemoryItem[] = [];
let nextLocalId = 1;

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

export function addFamilyMemoryItem({
  memo,
  hasPhoto,
  photoUri = null,
  photoUris,
  hasVoiceMemo = false,
  voiceDurationSeconds = 0,
  voiceUri = null,
}: CreateFamilyMemoryItemParams) {
  const nextPhotoUris = photoUris ?? (photoUri ? [photoUri] : []);
  const item: FamilyMemoryItem = {
    id: `local-memory-${Date.now()}-${nextLocalId}`,
    authorName: '딸',
    authorRelation: '딸',
    memo: memo.trim(),
    hasPhoto: hasPhoto || nextPhotoUris.length > 0,
    photoUri: nextPhotoUris[0] ?? null,
    photoUris: nextPhotoUris,
    hasVoiceMemo,
    voiceDurationSeconds,
    voiceUri,
    createdAt: new Date().toISOString(),
  };

  nextLocalId += 1;
  memoryItems = [item, ...memoryItems];
  emitChange();

  return item;
}

export function removeFamilyMemoryItem(id: string) {
  memoryItems = memoryItems.filter((item) => item.id !== id);
  emitChange();
}

export function updateFamilyMemoryItem(
  id: string,
  nextItem: Partial<Pick<FamilyMemoryItem, 'memo' | 'hasPhoto' | 'photoUri' | 'photoUris' | 'hasVoiceMemo' | 'voiceDurationSeconds' | 'voiceUri'>>,
) {
  memoryItems = memoryItems.map((item) => (
    item.id === id
      ? {
          ...item,
          ...nextItem,
        }
      : item
  ));
  emitChange();
}

export function useFamilyMemoryItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
