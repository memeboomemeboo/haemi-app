import { fetchApi, get, patch, post } from './client';
import type { ApiResponse } from '@/shared/types';

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

export interface AlbumPersonOption {
  personId: string;
  name: string;
  relation: string;
}

export async function createAlbum(): Promise<Album> {
  const homeResponse = await get<ApiResponse<HomeContext>>('/home');
  const response = await post<ApiResponse<Album>>('/albums', {
    elderProfileId: homeResponse.data.elderId,
    groupId: homeResponse.data.groupId,
  });

  return response.data;
}

export async function getAlbumById(albumId: string): Promise<Album> {
  const response = await get<ApiResponse<Album>>(`/albums/${albumId}`);
  return response.data;
}

export async function getAlbumPersonOptions(): Promise<AlbumPersonOption[]> {
  const homeResponse = await get<ApiResponse<HomeContext>>('/home');
  const response = await get<ApiResponse<AlbumPersonOption[]>>(
    `/groups/${homeResponse.data.groupId}/persons`
  );

  return response.data;
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
