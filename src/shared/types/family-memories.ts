export type FamilyMemoryPostStatus = 'DRAFT' | 'PUBLISHED' | 'DELETED';

export type FamilyMemoryReplyType = 'POEM' | 'IMAGE' | 'SHORT_TEXT';

export type FamilyMemoryFeedSort = 'LATEST' | 'POPULAR';

export type FamilyMemoryFeedPeriod = 'ALL' | 'WEEKLY' | 'MONTHLY';

export type FamilyMemoryElderReply = {
  replyType?: FamilyMemoryReplyType;
  content?: string;
  repliedAt?: string;
};

export type FamilyMemoryPost = {
  postId: string;
  albumId?: string;
  authorMemberId?: string;
  authorName?: string;
  authorRelation?: string;
  textContent?: string;
  photoKeys?: string[];
  voiceMemoKey?: string;
  status?: FamilyMemoryPostStatus;
  elderReply?: FamilyMemoryElderReply;
  likeCount?: number;
  popularityScore?: number;
  readByElder?: boolean;
  publishedAt?: string;
  createdAt?: string;
};

export type FamilyMemoryFeed = {
  posts: FamilyMemoryPost[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
};

export type GroupMemoryMedia = {
  mediaId: string;
  type: 'IMAGE' | 'AUDIO';
  accessUrl?: string;
  durationMs?: number;
  displayOrder?: number;
};

export type GroupMemory = {
  memoryId: string;
  authorName?: string;
  authorRelation?: string;
  textContent?: string;
  createdAt?: string;
  media?: GroupMemoryMedia[];
};

export type GroupMemoryFeed = {
  memories: GroupMemory[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
};

export type CreateFamilyMemoryPostRequest = {
  memberId: string;
  memberName: string;
  relation: string;
  textContent?: string;
  publishImmediately: boolean;
};

export type FamilyMemoryPhotoUpload = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type FamilyMemoryApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export type GetFamilyMemoryFeedParams = {
  albumId: string;
  sortBy?: FamilyMemoryFeedSort;
  period?: FamilyMemoryFeedPeriod;
  page?: number;
  size?: number;
};

export type CreateFamilyMemoryPostParams = {
  albumId: string;
  data: CreateFamilyMemoryPostRequest;
  photos?: FamilyMemoryPhotoUpload[];
};
