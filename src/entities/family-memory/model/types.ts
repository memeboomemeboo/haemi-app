export type FamilyMemoryItem = {
  id: string;
  authorName: string;
  authorRelation: string;
  memo: string;
  hasPhoto: boolean;
  photoUri: string | null;
  photoUris: string[];
  hasVoiceMemo: boolean;
  voiceDurationSeconds: number;
  voiceUri: string | null;
  createdAt: string;
};

export type CreateFamilyMemoryItemParams = {
  memo: string;
  hasPhoto: boolean;
  photoUri?: string | null;
  photoUris?: string[];
  hasVoiceMemo?: boolean;
  voiceDurationSeconds?: number;
  voiceUri?: string | null;
};
