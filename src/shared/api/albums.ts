import { apiClient } from './client';

export interface AlbumPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  fileName: string;
  size: number;
  uploadedBy?: string;
}

export interface AlbumMember {
  id: string;
  name: string;
  relation?: string;
  profileImageUrl?: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  photoCount: number;
  memberCount: number;
  members: AlbumMember[];
  createdAt: string;
  updatedAt: string;
}

export interface AlbumCreateRequest {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface PhotoUploadRequest {
  fileName: string;
  mimeType: string;
  base64Data?: string;
  uri?: string;
}

export interface AlbumPhotoCreateRequest {
  photos: PhotoUploadRequest[];
  uploadedBy?: string;
  description?: string;
}

/**
 * 앨범 목록 조회
 */
export async function getAlbums(params?: { limit?: number; offset?: number }): Promise<Album[]> {
  const queryString = params
    ? `?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]) as [string, string][]
      ).toString()}`
    : '';

  return apiClient.get<Album[]>(`/albums${queryString}`);
}

/**
 * 특정 앨범 조회
 */
export async function getAlbumById(albumId: string): Promise<Album> {
  return apiClient.get<Album>(`/albums/${albumId}`);
}

/**
 * 앨범 생성
 */
export async function createAlbum(data: AlbumCreateRequest): Promise<Album> {
  return apiClient.post<Album>('/albums', data);
}

/**
 * 앨범 수정
 */
export async function updateAlbum(albumId: string, data: Partial<AlbumCreateRequest>): Promise<Album> {
  return apiClient.put<Album>(`/albums/${albumId}`, data);
}

/**
 * 앨범 삭제
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  await apiClient.delete<void>(`/albums/${albumId}`);
}

/**
 * 앨범 내 사진 목록 조회
 */
export async function getAlbumPhotos(
  albumId: string,
  params?: { limit?: number; offset?: number }
): Promise<AlbumPhoto[]> {
  const queryString = params
    ? `?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]) as [string, string][]
      ).toString()}`
    : '';

  return apiClient.get<AlbumPhoto[]>(`/albums/${albumId}/photos${queryString}`);
}

/**
 * 앨범에 사진 업로드
 */
export async function uploadAlbumPhotos(
  albumId: string,
  data: AlbumPhotoCreateRequest
): Promise<AlbumPhoto[]> {
  return apiClient.post<AlbumPhoto[]>(`/albums/${albumId}/photos`, data);
}

/**
 * 앨범에서 사진 삭제
 */
export async function deleteAlbumPhoto(albumId: string, photoId: string): Promise<void> {
  await apiClient.delete<void>(`/albums/${albumId}/photos/${photoId}`);
}

/**
 * 앨범에 가족 구성원 추가
 */
export async function addAlbumMember(albumId: string, memberId: string): Promise<Album> {
  return apiClient.post<Album>(`/albums/${albumId}/members`, { memberId });
}

/**
 * 앨범에서 가족 구성원 제거
 */
export async function removeAlbumMember(albumId: string, memberId: string): Promise<Album> {
  return apiClient.delete<Album>(`/albums/${albumId}/members/${memberId}`);
}
