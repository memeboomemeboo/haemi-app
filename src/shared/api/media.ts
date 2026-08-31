import { post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

/** 백엔드 MediaType enum과 동일하게 유지한다. */
export type MediaType =
  | 'MEMORY_IMAGE'
  | 'PROFILE_IMAGE'
  | 'RESPONSE_VOICE'
  | 'RESPONSE_IMAGE';

export interface RequestMediaUploadInput {
  mediaType: MediaType;
  originalFilename: string;
  contentType: string;
  declaredSizeBytes: number;
  declaredDurationSeconds?: number;
}

export interface RequestMediaUploadResponse {
  mediaRefId: string;
  presignedUrl?: string;
  duplicate?: boolean;
  servingUrl?: string;
}

/** presigned URL 발급 요청 — 실제 파일 업로드 전 호출 */
export async function requestMediaUpload(
  data: RequestMediaUploadInput,
  signal?: AbortSignal,
): Promise<RequestMediaUploadResponse> {
  const response = await post<SwaggerApiResponse<RequestMediaUploadResponse>>(
    '/media/upload-request',
    data,
    { signal },
  );
  return response.data;
}

/** presigned URL로 파일 바이트를 직접 업로드한다 (S3 등 스토리지로 바로 PUT) */
export async function uploadMediaBytes(presignedUrl: string, uri: string, contentType: string): Promise<void> {
  const blob = await (await fetch(uri)).blob();
  const putResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error('Upload failed');
  }
}

/** 업로드 확정 — 완료된 mediaRefId를 서비스에 알리고 서빙 URL을 받는다 */
export async function confirmMediaUpload(mediaRefId: string, signal?: AbortSignal): Promise<string> {
  const response = await post<SwaggerApiResponse<string>>(`/media/${mediaRefId}/confirm`, undefined, {
    signal,
  });
  return response.data;
}

/**
 * 로컬 파일(uri)을 서버에 업로드하고 mediaRefId를 반환하는 전체 과정을 한 번에 처리한다.
 * requestMediaUpload → (duplicate가 아니면) presigned URL로 업로드 → confirmMediaUpload
 */
export async function uploadMediaFile({
  uri,
  mediaType,
  filename,
  contentType,
  sizeBytes,
  durationSeconds,
  signal,
}: {
  uri: string;
  mediaType: MediaType;
  filename: string;
  contentType: string;
  sizeBytes?: number;
  durationSeconds?: number;
  signal?: AbortSignal;
}): Promise<{ mediaRefId: string; servingUrl?: string }> {
  const fileBlob = await (await fetch(uri, { signal })).blob();
  const declaredSizeBytes = sizeBytes ?? fileBlob.size;

  if (declaredSizeBytes <= 0) {
    throw new Error('File size must be greater than zero');
  }

  const upload = await requestMediaUpload(
    {
      mediaType,
      originalFilename: filename,
      contentType,
      declaredSizeBytes,
      declaredDurationSeconds: durationSeconds,
    },
    signal,
  );

  if (upload.duplicate) {
    return { mediaRefId: upload.mediaRefId, servingUrl: upload.servingUrl };
  }

  if (!upload.presignedUrl) {
    throw new Error('Missing upload URL');
  }

  const putResponse = await fetch(upload.presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: fileBlob,
    signal,
  });

  if (!putResponse.ok) {
    throw new Error('Upload failed');
  }
  const servingUrl = await confirmMediaUpload(upload.mediaRefId, signal);

  return { mediaRefId: upload.mediaRefId, servingUrl };
}
