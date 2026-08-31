import { post } from './client';
import type { SwaggerApiResponse } from '@/shared/types';

/** 서버 MediaType — 업로드 대상별로 값이 다르다 (프로필 사진 외 값은 백엔드 확정 전 추정치) */
export type MediaType = 'PROFILE_IMAGE' | 'ELDER_RESPONSE_VOICE' | 'ELDER_RESPONSE_IMAGE' | 'MEMORY_IMAGE';

export interface RequestMediaUploadInput {
  mediaType: MediaType;
  originalFilename: string;
  contentType: string;
  declaredSizeBytes?: number;
}

export interface RequestMediaUploadResponse {
  mediaRefId: string;
  presignedUrl?: string;
  duplicate?: boolean;
  servingUrl?: string;
}

/** presigned URL 발급 요청 — 실제 파일 업로드 전 호출 */
export async function requestMediaUpload(
  data: RequestMediaUploadInput
): Promise<RequestMediaUploadResponse> {
  const response = await post<SwaggerApiResponse<RequestMediaUploadResponse>>('/media/upload-request', data);
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
export async function confirmMediaUpload(mediaRefId: string): Promise<string> {
  const response = await post<SwaggerApiResponse<string>>(`/media/${mediaRefId}/confirm`);
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
}: {
  uri: string;
  mediaType: MediaType;
  filename: string;
  contentType: string;
  sizeBytes?: number;
}): Promise<{ mediaRefId: string; servingUrl?: string }> {
  const upload = await requestMediaUpload({
    mediaType,
    originalFilename: filename,
    contentType,
    declaredSizeBytes: sizeBytes,
  });

  if (upload.duplicate) {
    return { mediaRefId: upload.mediaRefId, servingUrl: upload.servingUrl };
  }

  if (!upload.presignedUrl) {
    throw new Error('Missing upload URL');
  }

  await uploadMediaBytes(upload.presignedUrl, uri, contentType);
  const servingUrl = await confirmMediaUpload(upload.mediaRefId);

  return { mediaRefId: upload.mediaRefId, servingUrl };
}
