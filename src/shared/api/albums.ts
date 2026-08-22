import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi, get, patch, post } from './client';
import type { ApiResponse } from '@/shared/types';

const ALBUM_ID_STORAGE_PREFIX = 'haemi_album_id';

export interface AlbumPersonTag {
  memberId: string;
  memberName: string;
}

export interface AlbumPhoto {
  photoId: string;
  storageKey: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  shotAt?: string;
  timePeriod?: string;
  locationText?: string;
  memo?: string;
  personTags: AlbumPersonTag[];
  analysisStatus: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Album {
  albumId: string;
  elderProfileId: string;
  groupId: string;
  ownerMemberId: string;
  memberIds: string[];
  photoCount: number;
  recentPhotos: AlbumPhoto[];
  createdAt: string;
}

interface HomeContext {
  elderId: string;
  groupId: string;
}

export interface AlbumPhotoMemoRequest {
  timePeriod?: string;
  locationText?: string;
  memo?: string;
  personTags?: AlbumPersonTag[];
}

export interface AlbumPhotoUpload {
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface AlbumMemberOption {
  memberId: string;
  relation: string;
}

interface AlbumGroup {
  members: AlbumMemberOption[];
}

async function getHomeContext(): Promise<HomeContext> {
  const response = await get<ApiResponse<HomeContext>>('/home');
  return response.data;
}

function getAlbumIdStorageKey(groupId: string): string {
  return `${ALBUM_ID_STORAGE_PREFIX}:${groupId}`;
}

async function createAlbum(homeContext: HomeContext): Promise<Album> {
  const response = await post<ApiResponse<Album>>('/albums', {
    elderProfileId: homeContext.elderId,
    groupId: homeContext.groupId,
  });

  return response.data;
}

export async function getOrCreateAlbum(albumId?: string): Promise<Album> {
  const homeContext = await getHomeContext();
  const storageKey = getAlbumIdStorageKey(homeContext.groupId);

  if (albumId) {
    await AsyncStorage.setItem(storageKey, albumId);
    return getAlbumById(albumId);
  }

  const storedAlbumId = await AsyncStorage.getItem(storageKey);

  if (storedAlbumId) {
    return getAlbumById(storedAlbumId);
  }

  const album = await createAlbum(homeContext);
  await AsyncStorage.setItem(storageKey, album.albumId);
  return album;
}

export async function getAlbumById(albumId: string): Promise<Album> {
  const response = await get<ApiResponse<Album>>(`/albums/${albumId}`);
  return response.data;
}

export async function getAlbumMemberOptions(): Promise<AlbumMemberOption[]> {
  const homeContext = await getHomeContext();
  const response = await get<ApiResponse<AlbumGroup>>(`/groups/${homeContext.groupId}`);

  return response.data.members;
}

export async function uploadAlbumPhoto(albumId: string, photo: AlbumPhotoUpload) {
  const formData = new FormData();
  formData.append('files', {
    uri: photo.uri,
    name: photo.fileName,
    type: photo.mimeType,
  } as unknown as Blob);

  const response = await fetchApi<ApiResponse<AlbumPhoto[]>>(`/albums/${albumId}/photos`, {
    method: 'POST',
    body: formData,
  });

  return response.data;
}

export async function updateAlbumPhotoMemo(
  albumId: string,
  photoId: string,
  data: AlbumPhotoMemoRequest
): Promise<AlbumPhoto> {
  const response = await patch<ApiResponse<AlbumPhoto>>(
    `/albums/${albumId}/photos/${photoId}/memo`,
    data
  );

  return response.data;
}
